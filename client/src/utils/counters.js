export function countServiceNumbers(items) {
    return items.reduce((counters, item) => {
        const serviceNumber = item.service_number;
        if (counters[serviceNumber]) {
            counters[serviceNumber]++;
        } else {
            counters[serviceNumber] = 1;
        }
        return counters;
    }, {});
}
