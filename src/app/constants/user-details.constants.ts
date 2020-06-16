export const taxpro = {
    firstName: 'Rachel',
    lastName: 'Jane'
};

export const customer = {
    firstName: 'Harold',
    lastName: 'James'
};

export function getCustomerName() {
    return customer.lastName + ', ' + customer.firstName;
}

export function getTaxproName() {
    return taxpro.lastName + ', ' + taxpro.firstName;
}
