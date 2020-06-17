export const taxpro = {
    firstName: 'Rachel',
    lastName: 'Jane',
    role: 'TaxPro'
};

export const customer = {
    firstName: 'Harold',
    lastName: 'James',
    role: 'Customer'
};

export function getRoleByName(name: string) {
    if (['Rachel', 'Jane', 'Rachel, Jane', 'Jane, Rachel'].includes(name)) {
        return taxpro.role;
    } else if (['Harold', 'James', 'Harold, James', 'James, Harold'].includes(name)) {
        return customer.role;
    }
}

export function getCustomerName() {
    return customer.lastName + ', ' + customer.firstName;
}

export function getTaxproName() {
    return taxpro.lastName + ', ' + taxpro.firstName;
}
