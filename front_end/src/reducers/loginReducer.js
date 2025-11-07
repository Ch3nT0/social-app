const initialState = false; // mặc định chưa login

const loginReducer = (state = initialState, action) => {
    switch (action.type) {
        case "CHECK_LOGIN":
            return action.status; // cập nhật theo true/false
        default:
            return state;
    }
};

export default loginReducer;