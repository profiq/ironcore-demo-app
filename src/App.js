import React, {Component} from 'react'
import * as IronWeb from '@ironcorelabs/ironweb'
import jwt from 'jsonwebtoken'
import './styles.css'
import {
    Grid,
    GridCell,
    Snackbar,
    Toolbar,
    ToolbarFixedAdjust,
    ToolbarIcon,
    ToolbarRow,
    ToolbarSection,
    ToolbarTitle
} from 'rmwc'
import config from './ironcore-config'
import Login from './components/Login'
import NavMenu from './components/NavMenu'
import MemberManagement from './components/MemberManagement';
import Messages from './components/Messages';
import SendMessage from './components/SendMessage';
import GroupSelection from './components/GroupSelection';

class App extends Component {

    state = {
        logged: '',
        groupSelected: '',
        selectedMenuItem: 'group',
        newGroupName: '',
        addMemberName: '',
        removeMemberName: '',
        memberToRemove: '',
        groupList: [],
        groupMembers: [],
        documentList: [],
        documentListGroup: [],
        snackbar: ''
    };

    login = (username, password) => {
        return IronWeb.initialize(() => {
            return new Promise((resolve) => {
                resolve(jwt.sign({
                    pid: config.projectId,
                    sid: config.segmentId,
                    kid: config.serviceKeyId
                }, config.privateKey, {
                    algorithm: "ES256",
                    expiresIn: "2m",
                    subject: username
                }))
            })
        }, () => {
            return new Promise((resolve) => {
                resolve(password)
            })
        }).then(() => {
            window.addEventListener('beforeunload', this.logout);
            this.setState({
                logged: 'username'
            }, this.loadData)
        })
    };

    logout = () => {
        IronWeb.user.deauthorizeDevice().then(() => {
            console.log('listener removed');
            window.removeEventListener('beforeunload', this.logout);
            this.setState({
                logged: '',
                groupSelected: '',
                component: 'group',
                newGroupName: '',
                addMemberName: '',
                removeMemberName: '',
                memberToRemove: '',
                groupMembers: [],
                groupList: [],
                documentList: [],
                documentListGroup: [],
                snackbar: ''
            })
        })
    };


    changeSelectedGroup = (event) => {
        let groupID = event ? event.target.value : this.state.groupSelected;
        if (groupID)
            IronWeb.group.get(groupID).then((res) => {
                this.setState({
                    groupMembers: res.groupMembers,
                    groupSelected: res.groupID
                }, this.documentGroupFilter)
            })
    };

    createNewGroup = (newGroupName) => {
        return IronWeb.group.create({
            groupName: newGroupName
        }).then(() => {
            this.setState({
                snackbar: newGroupName + ' created successfully',
            }, this.loadData)
        })
    };

    encrypt = (encryptInput) => {
        return IronWeb.document.encryptToStore(IronWeb.codec.utf8.toBytes(encryptInput), {
            accessList: {
                groups: [{
                    'id': this.state.groupSelected
                }]
            }
        }).then((res) => {
                this.setState({
                    snackbar: 'Successfully encrypted into store with ID: ' + res.documentID
                }, this.loadData)
            }
        )
    };

    addMember = (addMemberName) => {
        return IronWeb.group.addMembers(this.state.groupSelected, [addMemberName]).then(() => {
            this.setState({
                snackbar: this.state.addMemberName + ' successfully added',
            }, this.loadData)
        })
    };

    removeMember = (memberToRemove, yourself = false) => {
        if (this.state.logged === memberToRemove || yourself)
            return IronWeb.group.removeSelfAsMember(this.state.groupSelected).then(() => {
                this.setState({
                    groupSelected: '',
                    snackbar: 'You were successfully removed'
                }, this.loadData)
            });
        else {
            return IronWeb.group.removeMembers(this.state.groupSelected, [memberToRemove])
                .then(() => {
                    this.setState({
                        snackbar: memberToRemove + ' successfully removed'
                    }, this.loadData)
                })
        }
    };

    decrypt = (documentID, decryptAll) => {
        let documentListUpdated = [];
        let decryption = '';
        let promises = [];
        this.state.documentListGroup.forEach((document) => {
            if ((document.documentID === documentID) || decryptAll)
                promises = [...promises, IronWeb.document.decryptFromStore(document.documentID).then((res) => {
                    decryption = IronWeb.codec.utf8.fromBytes(res.data);
                    documentListUpdated = [...documentListUpdated, {...document, decrypted: decryption}]
                })];
            else {
                documentListUpdated = [...documentListUpdated, document]
            }
        });
        return Promise.all(promises).then(() => {
            this.setState({
                documentListGroup: documentListUpdated,
                snackbar: 'Successfully decrypted'
            })
        })
    };

    delete = (documentID) => {
        IronWeb.document.revokeAccess(documentID, {
            users: [],
            groups: [
                {
                    'id': this.state.groupSelected
                }
            ]
        }).then(this.loadData)
    };

    changeMenuItem = (item) => {
        this.setState({
            selectedMenuItem: item
        })
    };

    documentGroupFilter = () => {
        let groupDocuments = [];
        let promises = [];
        this.state.documentList.forEach((document) => {
            promises = [...promises, (IronWeb.document.getMetadata(document.documentID).then((res) => {
                if ((res.visibleTo.groups[0] && res.visibleTo.groups[0].id) === this.state.groupSelected) {
                    groupDocuments = [...groupDocuments, {...document, decrypted: ''}]
                }
            }))]
        });
        Promise.all(promises).then(() => {
            this.setState({
                documentListGroup: groupDocuments
            })
        })
    };

    loadData = () => {
        let documentList = [];
        let orderNumber = 0;
        IronWeb.group.list().then((group) => {
            IronWeb.document.list().then((document) => {
                documentList = document.result;
                documentList = documentList.map((document) => {
                    document = {
                        ...document,
                        order: orderNumber++
                    };
                    return document
                });
                this.setState({
                    groupList: group.result,
                    documentList: documentList,
                }, this.changeSelectedGroup)
            })
        })
    };

    renderSelectedMenuItem = () => {
        if (this.state.groupSelected === '' && this.state.selectedMenuItem !== 'group')
            return 'Please select group first';
        switch (this.state.selectedMenuItem) {
            case 'group':
                return (<GroupSelection groupSelected={this.state.groupSelected} groupList={this.state.groupList}
                                        changeSelectedGroup={this.changeSelectedGroup}
                                        createNewGroup={this.createNewGroup}/>);
            case 'members':
                return (<MemberManagement groupSelected={this.state.groupSelected} groupList={this.state.groupList}
                                          groupMembers={this.state.groupMembers} addMember={this.addMember}
                                          removeMember={this.removeMember}/>);
            case 'message':
                return (<Messages documentListGroup={this.state.documentListGroup} decrypt={this.decrypt}
                                  delete={this.delete}/>);
            case 'sendmsg':
                return (<SendMessage encrypt={this.encrypt}/>);
            default:
                return (<div/>);
        }
    };

    render() {
        if (this.state.logged)
            return (
                <div>
                    <React.Fragment>
                        <Toolbar fixed>
                            <ToolbarRow>
                                <ToolbarSection alignStart>
                                    <ToolbarTitle>
                                        profiq IronCore test app
                                    </ToolbarTitle>
                                </ToolbarSection>
                                <ToolbarSection alignEnd>
                                    <ToolbarIcon use='exit_to_app' onClick={this.logout}/>
                                </ToolbarSection>
                            </ToolbarRow>
                        </Toolbar>
                    </React.Fragment>
                    <ToolbarFixedAdjust className='content'>
                        <NavMenu loadData={this.loadData} changeMenuItem={this.changeMenuItem}/>
                        <main>
                            <Grid style={{padding: 0}}>
                                <GridCell span="2"/>
                                <GridCell span="12"
                                          style={{textAlign: 'center', marginLeft: '25%', marginRight: '5%'}}>
                                    {this.renderSelectedMenuItem()}
                                </GridCell>
                            </Grid>
                        </main>
                    </ToolbarFixedAdjust>

                    <Snackbar
                        show={this.state.snackbar !== ''}
                        message={this.state.snackbar}
                        alignStart
                        actionText='x'
                        onHide={() => {
                            this.setState({
                                snackbar: ''
                            })
                        }}
                        actionHandler={() => {
                            this.setState({
                                snackbar: ''
                            })
                        }}
                    />
                </div>
            );
        else {
            return (
                <Login login={this.login}/>
            )
        }
    }
}

export default App
