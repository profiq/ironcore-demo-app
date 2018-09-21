import React, {Component} from 'react'
import {Button, Select, TextField} from "rmwc";
import {adminCheck} from "../utils";

class MemberManagement extends Component {
    constructor(props) {
        super(props);
        this.addMemberButton = React.createRef();
        this.removeMemberButton = React.createRef();
    }

    state = {
        addMemberName: '',
        memberToRemove: ''
    };

    changeAddMemberName = (event) => {
        this.setState({
            addMemberName: event.target.value
        })
    };

    changeMemberToRemove = (event) => {
        this.setState({
            memberToRemove: event.target.value
        })
    };

    handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            this.addMemberButton.current.click();
            this.addMemberButton.current.focus();
        }
    };

    render() {
        return (
            <div>
                Add Member?
                <br/>
                {adminCheck(this.props.groupList, this.props.groupSelected) && this.props.groupSelected ? (
                        <div>
                            <TextField
                                label='Add member'
                                value={this.state.addMemberName}
                                onChange={this.changeAddMemberName}
                                onKeyPress={this.handleKeyPress}
                            />
                            <br/>
                            <Button
                                raised
                                elementRef={this.addMemberButton}
                                onClick={() => {
                                    this.props.addMember(this.state.addMemberName)
                                        .then(() => {
                                            this.setState({
                                                addMemberName: ''
                                            }, () => {
                                                this.addMemberButton.current.blur();
                                            })
                                        })
                                }}
                            >
                                <div className='button'>Add Member</div>
                            </Button>
                        </div>
                    ) :
                    '\nYou cannot add members\n'}
                <br/>
                Remove Member?
                <br/>
                {this.props.groupSelected ? adminCheck(this.props.groupList, this.props.groupSelected) ? (
                        <div>
                            <Select
                                placeholder='Select member'
                                value={this.state.memberToRemove}
                                onChange={this.changeMemberToRemove}
                            >
                                {
                                    this.props.groupMembers.map((member) => {
                                        return (
                                            <option key={member} value={member}>{member}</option>
                                        )
                                    })
                                }
                            </Select>
                            <br/>
                            <br/>
                            <Button
                                raised
                                elementRef={this.removeMemberButton}
                                onClick={() => {
                                    this.props.removeMember(this.state.memberToRemove)
                                        .then(() => {
                                            this.setState({
                                                memberToRemove: ''
                                            }, () => {
                                                this.removeMemberButton.current.blur();
                                            })
                                        })
                                }}
                            >
                                <div className='button'>Remove Member</div>
                            </Button>
                        </div>
                    ) :
                    (
                        <Button
                            raised
                            onClick={this.props.removeMember('', true)}
                        >
                            <div className='button'>Remove yourself</div>
                        </Button>
                    ) :
                    '\nYou cannot remove members\n'}
            </div>
        )
    }
}

export default MemberManagement