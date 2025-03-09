const db = require('../config/db');

// Function to get data from emp_newtrainingrequested based on requestid
const getEmpNewTrainingRequestedByRequestId = (requestid) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                en.emp_id,
                e.emp_name,
                en.availablefrom,
                en.dailyband,
                en.availableonweekend,
                en.requestid,
                en.emailsentstatus,
                en.emailsentdate,
                en.comment,
                en.status,
                en.createddate,
                en.courses_assigned,
                e.profile_image,
                ntr.org_level AS request_org_level
            FROM emp_newtrainingrequested en
            JOIN employee e ON en.emp_id = e.emp_id
            JOIN newtrainingrequest ntr ON en.requestid = ntr.requestid
            WHERE en.requestid = ?;
        `;
        
        db.execute(query, [requestid], (err, results) => {
            if (err) {
                reject(err);
            } else {
                // Extract the org_level from the first row (since it's the same for all rows)
                const requestOrgLevel = results.length > 0 ? results[0].request_org_level : null;

                // Remove the org_level from each row to avoid redundancy
                const employees = results.map(row => {
                    const { request_org_level, ...rest } = row;
                    return rest;
                });

                // Return the employees and the org_level separately
                resolve({
                    employees,
                    request_org_level: requestOrgLevel
                });
            }
        });
    });
};

module.exports = {
    getEmpNewTrainingRequestedByRequestId
};