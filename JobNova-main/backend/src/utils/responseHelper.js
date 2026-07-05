const success = (res, data, status = 200, message = null) => {
    const body = { success: true, data };
    if (message) body.message = message;
    return res.status(status).json(body);
};

const fail = (res, error, status = 400) => {
    return res.status(status).json({ success: false, error });
};

module.exports = { success, fail };