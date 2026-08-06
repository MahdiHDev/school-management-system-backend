export const formatEmployeeResponse = (employee: any) => {
    const address = employee.address;

    return {
        ...employee,
        picture: {
            uri: employee.picture,
            name: employee.pictureName,
            type: employee.pictureType,
        },
        experience: {
            uri: employee.experience,
            name: employee.experienceName,
            type: employee.experienceType,
        },
        authoritySign: {
            uri: employee.authoritySign,
            name: employee.authoritySignName,
            type: employee.authoritySignType,
        },
        employeeSign: {
            uri: employee.employeeSign,
            name: employee.employeeSignName,
            type: employee.employeeSignType,
        },

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
