import React, {Component} from 'react'
import {Button, Select, TextField} from "rmwc";
import {adminCheck} from "../utils";

class GroupSelection extends Component {
    constructor(props){
        super(props);
        this.createGroupButton=React.createRef();
    }

    state={
        newGroupName: ''
    };

    changeNewGroupName = (event) => {
        this.setState({
            newGroupName: event.target.value
        })
    };


    handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            this.createGroupButton.current.click();
            this.createGroupButton.current.focus();
        }
    };

    render() {
        return (
            <div>
                <Select
                    placeholder='Select group'
                    value={this.props.groupSelected}
                    onChange={this.props.changeSelectedGroup}
                    disabled={this.props.groupList.length === 0}
                >
                    {this.props.groupList ? this.props.groupList.map((group) => {
                        return (<option key={group.groupID} value={group.groupID}>{group.groupName}</option>)
                    }) : ''}
                </Select>
                {this.props.groupSelected ? adminCheck(this.props.groupList,this.props.groupSelected) ? ' You are admin' : ' You are member' : ''}
                <br/>
                <TextField
                    label='Create Group'
                    value={this.state.newGroupName}
                    onChange={this.changeNewGroupName}
                    onKeyPress={this.handleKeyPress}
                />
                <br/>
                <Button
                    raised
                    elementRef={this.createGroupButton}
                    onClick={()=>{
                        this.props.createNewGroup(this.state.newGroupName)
                            .then(()=>{
                                this.createGroupButton.current.blur();
                                this.setState({
                                    newGroupName:''
                                })
                            })
                    }}
                    disabled={!this.state.newGroupName}
                >
                    <div className='button'>Create group</div>
                </Button>
            </div>
        )
    }
}

export default GroupSelection