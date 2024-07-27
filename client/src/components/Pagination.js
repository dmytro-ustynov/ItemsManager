import React, {useContext} from "react";
import {observer} from "mobx-react";
import Pagination from '@mui/material/Pagination';
import {StoreContext} from "../store/store";

function PaginationComponent() {
    const store = useContext(StoreContext)
    const {pending, pagination, setPage, items} = store

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    return (
        <div className="pagination-block">
            {!pending && items.length > 0 && <Pagination
                count={pagination.totalPages}
                page={pagination.currentPage}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
            />}
        </div>

    );
}

export default observer(PaginationComponent);