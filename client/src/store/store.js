import React, {createContext} from 'react';
import {useLocalObservable} from "mobx-react";
import {BASE_URL, FIELDS, ITEMS_PER_PAGE, SEARCH_URL} from "../utils/constants";
import {SERVICE_TO_NUMBER} from "../generated_constants";
import {fetcher} from "../utils/fetch_utils";
import {countServiceNumbers} from "../utils/counters";

export const StoreContext = createContext({});

export const StoreProvider = (({children}) => {
    const store = useLocalObservable(() => ({
            items: [],
            __allItems: [],
            fields: [],
            pending: false,
            message: "",
            alertLevel: "info",
            counters: {},
            pagination: {
                currentPage: 1,
                itemsPerPage: ITEMS_PER_PAGE,
                hasNextPage: false,
                hasPreviousPage: false,
                totalPages: 0,
            },

            setItems(items) {
                this.__allItems = items
                // this.items = items
                this.pagination.totalPages = Math.ceil(items.length / this.pagination.itemsPerPage);
                this.updatePagination();
                this.counters = countServiceNumbers(items)
                this.counters.total = items.length
            },
            updatePagination() {
                const startIndex = (this.pagination.currentPage - 1) * this.pagination.itemsPerPage;
                const endIndex = startIndex + this.pagination.itemsPerPage;
                this.items = this.__allItems.slice(startIndex, endIndex);
                this.pagination.hasPreviousPage = this.pagination.currentPage > 1;
                this.pagination.hasNextPage = this.pagination.currentPage < this.pagination.totalPages;
            },
            setPage(page) {
                if (page < 1 || page > this.pagination.totalPages) {
                    return;
                }
                this.pagination.currentPage = page;
                this.updatePagination();
            },
            async fetchItems() {
                const url = BASE_URL + SEARCH_URL
                if (this.items.length > 0) return; // If items are already fetched, do nothing
                console.log('fetching...')
                this.pending = true;
                try {
                    const data = await fetcher({url, method: "GET", credentials: true})
                    this.items = data.items || [];
                    this.fields = data.fields || [];
                } catch (error) {
                    console.error("Failed to fetch items:", error);
                    this.items = [];
                    this.fields = [];
                } finally {
                    this.pending = false;
                }
            },
            _getItemById(itemId) {
                return this.__allItems.find((item) => item.id === itemId || item._id === itemId)
            },
            setFields(fields) {
                let options = []
                fields.forEach(f => {
                    options.push({label: f, value: f})
                })
                this.fields = options
            },
            addItemField(itemId, newFieldName, newFieldValue) {
                const item = this._getItemById(itemId)
                item[newFieldName] = newFieldValue
            },
            replaceItem(itemId, payload) {
                const existingItem = this._getItemById(itemId);
                if (existingItem) {
                    const updatedItem = {...payload, _id: existingItem._id};
                    this.__allItems = this.__allItems.map(item =>
                        item._id === itemId ? updatedItem : item
                    );
                    this.items = this.items.map(item =>
                        item._id === itemId ? updatedItem : item
                    );
                } else {
                    console.warn('item not found', itemId)
                    this.items.push({...payload, _id: itemId})
                }
            },
            filterItems(filter) {
                const {search, service, category, younger_than, older_than, noService} = filter
                this.items = this.__allItems.filter((item) => {
                    let passSearch = !search;
                    let passService = !service;
                    let passCategories = !category;
                    let passYoungerThan = !younger_than;
                    let passOlderThan = !older_than;
                    let passNoService = !noService;

                    if (!!service && item.service_number === SERVICE_TO_NUMBER[service]) {
                        passService = true;
                    }
                    if (!!noService) {
                        // filter elements that are not related neither to VNLZ nor SZ
                        passNoService = item.service_number !== 1 && item.service_number !== 2
                    }

                    if (category && category.length > 0 && !!item.category) {
                        // Check if at least one category matches
                        passCategories = item.category.replaceAll(' ', '').split(',').some((itemCategory) =>
                            category.includes(itemCategory)
                        );

                    }
                    if (!!item[FIELDS.YEAR] && item[FIELDS.YEAR] >= younger_than) {
                        passYoungerThan = true;
                    }

                    if (!!item[FIELDS.YEAR] && item[FIELDS.YEAR] <= older_than) {
                        passOlderThan = true;
                    }
                    if (!!search) {
                        if (isNaN(search)) {
                            // by name
                            passSearch = item[FIELDS.NAME].toLowerCase().includes(search.toLowerCase())
                                || item[FIELDS.SERIAL]?.includes(search)
                        } else {
                            // by number
                            passSearch = item.inventory?.includes(search) || item[FIELDS.SERIAL]?.includes(search)
                        }
                    }
                    return passNoService && passService && passCategories && passYoungerThan && passOlderThan && passSearch;
                });
                this.counters.filtered = this.items.length
            },
            searchItems(search) {
                this.items = this.__allItems.filter((item) => {
                    if (isNaN(search)) {
                        // by name
                        return item[FIELDS.NAME].toLowerCase().includes(search.toLowerCase())
                            || item[FIELDS.SERIAL]?.includes(search)
                    } else {
                        // by number
                        return item.inventory?.includes(search) || item[FIELDS.SERIAL]?.includes(search)
                    }
                })
            },

            dropFilters() {
                this.items = this.__allItems
                this.counters.filtered = null
            },
            addItem(item) {
                this.__allItems.push(item)
                this.items.push(item)
                this.counters.total += 1
                this.counters[item.service_number] = this.counters[item.service_number] + 1
            },

            deleteItem(itemId) {
                this.__allItems = this.__allItems.filter((item) => item._id !== itemId);
                this.items = this.items.filter((item) => item._id !== itemId);
                this.counters.total -= 1
            },

            setMessage(message, level = null) {
                this.message = message
                if (!!level) {
                    this.alertLevel = level
                }
            },
            startRequest() {
                this.pending = true
            },
            finishRequest() {
                this.pending = false
            },

            clearMessage() {
                this.message = ""
                this.alertLevel = "info"
            },
            setAlertLevel(level) {
                this.alertLevel = level
            }
        })
    );

    return <StoreContext.Provider value={store}>
        {children}
    </StoreContext.Provider>
})
