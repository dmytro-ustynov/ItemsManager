export function serviceCounter(objects, serviceNumber) {
    let counter = 0
    objects.map((item) => {
        if (item.service_number === serviceNumber) counter ++
        return true
    })
    return counter
}