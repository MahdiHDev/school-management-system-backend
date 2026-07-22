export const formatEmployeeResponse = (employee: any) => {
    const address = employee.address;

    return {
        ...employee,

        address: address
            ? {
                  present: {
                      village: address.presentAddressVillage,
                      postOffice: address.presentAddressPostOffice,
                      postCode: address.presentAddressPostCode,
                      district: address.presentAddressDistrict,
                  },

                  permanent: {
                      village: address.permanentAddressVillage,
                      postOffice: address.permanentAddressPostOffice,
                      postCode: address.permanentAddressPostCode,
                      district: address.permanentAddressDistrict,
                  },
              }
            : null,
    };
};
