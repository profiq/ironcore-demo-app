export let adminCheck = (groupList, groupSelected) => {
    let isAdmin = false;
    groupList.forEach((group) => {
        if (groupSelected === group.groupID)
            isAdmin = group.isAdmin
    });
    return isAdmin
};