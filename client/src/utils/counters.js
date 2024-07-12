export function serviceCounter(objects, serviceNumber) {
    let counter = 0
    objects.map((item) => {
        if (item.service_number === serviceNumber) counter ++
        return true
    })
    return counter
}

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
