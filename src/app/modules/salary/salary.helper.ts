export const formatSalaryMonth = (salaryMonth: string) => {
    const [month, year] = salaryMonth.split("/");
    const monthName = new Intl.DateTimeFormat("en-US", {
        month: "long",
        timeZone: "UTC",
    }).format(new Date(Date.UTC(Number(year), Number(month) - 1)));

    return `${monthName}, ${year}`;
};
