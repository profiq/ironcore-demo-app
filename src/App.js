import React, {Component} from 'react'
import * as IronWeb from '@ironcorelabs/ironweb'
import jwt from 'jsonwebtoken'
import ReactTooltip from 'react-tooltip'
import './styles.css'
import {
    Button,
    Drawer,
    DrawerContent,
    DrawerHeader,
    Grid,
    GridCell,
    Icon,
    List,
    ListItem,
    ListItemText,
    Select,
    Snackbar,
    TextField,
    Toolbar,
    ToolbarFixedAdjust,
    ToolbarIcon,
    ToolbarRow,
    ToolbarSection,
    ToolbarTitle
} from 'rmwc'
import config from './ironcore-config'
import Login from './Login.js'

class App extends Component {

    state = {
        logged: '',
        groupSelected: '',
        component: 'group',
        newGroupName: '',
        addMemberName: '',
        removeMemberName: '',
        encryptInput: '',
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
            this.setState({
                logged: 'username'
            }, this.loadData)
        })
    };

    logout = () => {
        this.setState({
            logged: '',
            groupSelected: '',
            component: 'group',
            newGroupName: '',
            addMemberName: '',
            removeMemberName: '',
            encryptInput: '',
            memberToRemove: '',
            groupMembers: [],
            groupList: [],
            documentList: [],
            documentListGroup: [],
            snackbar: ''
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

    changeNewGroupName = (event) => {
        this.setState({
            newGroupName: event.target.value
        })
    };

    changeMemberToRemove = (event) => {
        this.setState({
            memberToRemove: event.target.value
        })
    };

    createNewGroup = () => {
        IronWeb.group.create({
            groupName: this.state.newGroupName
        }).then(() => {
            this.setState({
                snackbar: this.state.newGroupName + ' created successfully',
                newGroupName: ''
            }, this.loadData)
        })
    };

    changeAddMemberName = (event) => {
        this.setState({
            addMemberName: event.target.value
        })
    };

    changeEncryptInput = (event) => {
        this.setState({
            encryptInput: event.target.value
        })
    };

    encrypt = () => {
        IronWeb.document.encryptToStore(IronWeb.codec.utf8.toBytes(this.state.encryptInput), {
            accessList: {
                groups: [{
                    'id': this.state.groupSelected
                }]
            }
        }).then((res) => {
                this.setState({
                    encryptInput: '',
                    snackbar: 'Successfully encrypted into store with ID: ' + res.documentID
                }, this.loadData)
            }
        )
    };

    addMember = () => {
        IronWeb.group.addMembers(this.state.groupSelected, [this.state.addMemberName]).then(() => {
            this.setState({
                snackbar: this.state.addMemberName + ' successfully added',
                addMemberName: ''
            }, this.loadData)
        })
    };

    removeMember = () => {
        if (this.state.logged === this.state.memberToRemove)
            IronWeb.group.removeSelfAsMember(this.state.groupSelected).then(() => {
                this.setState({
                    groupSelected: '',
                    snackbar: 'You were successfully removed'
                }, this.loadData)
            });
        else {
            IronWeb.group.removeMembers(this.state.groupSelected, [this.state.memberToRemove])
                .then(() => {
                    this.setState({
                        snackbar: this.state.memberToRemove + ' successfully removed',
                        memberToRemove: ''
                    }, this.loadData)
                })
        }
    };

    removeYourself = () => {
        IronWeb.group.removeSelfAsMember(this.state.groupSelected).then(() => {
            this.setState({
                groupSelected: '',
                snackbar: 'You were successfully removed'
            }, this.loadData)
        })
    };

    adminCheck = () => {
        let isadmin = false;
        this.state.groupList.forEach((group) => {
            if (this.state.groupSelected === group.groupID)
                isadmin = group.isAdmin
        });
        return isadmin
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
        Promise.all(promises).then(() => {
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

    docSort = (docA, docB) => {
        if (docA.order < docB.order) return -1;
        if (docA.order > docB.order) return 1;
        return 0
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

    drawer = (
        <Drawer permanent style={{height: '100%', position: 'fixed'}}>
            <DrawerHeader>
                <ListItem onClick={() => {
                    this.loadData()
                }}>
                    <Icon use='refresh'/>
                </ListItem>
            </DrawerHeader>
            <DrawerContent>
                <ListItem onClick={() => {
                    this.setState({
                        component: 'group'
                    })
                }}>
                    <ListItemText>
                        Group selection
                    </ListItemText>
                </ListItem>
                <ListItem onClick={() => {
                    this.setState({
                        component: 'members'
                    })
                }}>
                    <ListItemText>
                        Group management
                    </ListItemText>
                </ListItem>
                <ListItem onClick={() => {
                    this.setState({
                        component: 'message'
                    })
                }}>
                    <ListItemText>
                        Messages
                    </ListItemText>
                </ListItem>
                <ListItem onClick={() => {
                    this.setState({
                        component: 'sendmsg'
                    })
                }}>
                    <ListItemText>
                        Send Message
                    </ListItemText>
                </ListItem>
            </DrawerContent>
        </Drawer>
    );

    render() {

        let groupSelection = (
            <div>
                <Select
                    placeholder='Select group'
                    value={this.state.groupSelected}
                    onChange={this.changeSelectedGroup}
                    disabled={this.state.groupList.length === 0}
                >
                    {this.state.groupList ? this.state.groupList.map((group) => {
                        return (<option key={group.groupID} value={group.groupID}>{group.groupName}</option>)
                    }) : ''}
                </Select>
                {this.state.groupSelected ? this.adminCheck() ? ' You are admin' : ' You are member' : ''}
                <br/>
                <TextField
                    label='Create Group'
                    value={this.state.newGroupName}
                    onChange={this.changeNewGroupName}
                />
                <br/>
                <Button
                    raised
                    onClick={this.createNewGroup}
                    disabled={!this.state.newGroupName}
                >
                    <div className='button'>Create group</div>
                </Button>
            </div>
        );

        let memberManagement = (
            <div>
                Add Member?
                <br/>
                {this.adminCheck() && this.state.groupSelected ? (
                        <div>
                            <TextField
                                label='Add member'
                                value={this.state.addMemberName}
                                onChange={this.changeAddMemberName}
                            />
                            <br/>
                            <Button
                                raised
                                onClick={this.addMember}
                            >
                                <div className='button'>Add Member</div>
                            </Button>
                        </div>
                    ) :
                    '\nYou cannot add members\n'}
                <br/>
                Remove Member?
                <br/>
                {this.state.groupSelected ? this.adminCheck() ? (
                        <div>
                            <Select
                                placeholder='Select member'
                                value={this.state.memberToRemove}
                                onChange={this.changeMemberToRemove}
                            >
                                {
                                    this.state.groupMembers.map((member) => {
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
                                onClick={this.removeMember}
                            >
                                <div className='button'>Remove Member</div>
                            </Button>
                        </div>
                    ) :
                    (
                        <Button
                            raised
                            onClick={this.removeYourself}
                        >
                            <div className='button'>Remove yourself</div>
                        </Button>
                    ) :
                    '\nYou cannot remove members\n'}
            </div>
        );

        let message = (
            <div>
                {this.state.documentListGroup.length ?
                    <Button
                        raised
                        onClick={() => {
                            this.decrypt({}, true)
                        }}
                    >
                        <div className='button'>Decrypt All</div>
                    </Button>
                    : 'There are no messages yet'}
                <List>
                    {
                        this.state.documentListGroup.sort(this.docSort).map((document) => {
                            return (<ListItem key={document.documentID}>
                                <ListItemText key={document.documentID}>
                                    {document.documentID}
                                    {' '}
                                    <a data-tip={document.decrypted}>
                                        {document.decrypted.substring(0, 20)}
                                    </a>
                                    {' '}
                                    <Button
                                        raised
                                        onClick={() => {
                                            this.decrypt(document.documentID, false)
                                        }}
                                    >
                                        <div className='button'>Decrypt</div>
                                    </Button>
                                    {' '}
                                    <Button
                                        raised
                                        onClick={() => {
                                            this.delete(document.documentID)
                                        }}
                                    >
                                        <div className='button'>Delete</div>
                                    </Button>
                                </ListItemText>
                            </ListItem>)
                        })
                    }
                </List>
                <ReactTooltip effect='solid' multiline={true}/>
            </div>
        );

        let sendMessage = (
            <div>
                <TextField
                    textarea
                    fullwidth
                    rows='6'
                    label='Encrypt a document'
                    value={this.state.encryptInput}
                    onChange={this.changeEncryptInput}
                />
                <br/>
                <Button
                    raised
                    onClick={this.encrypt}
                >
                    <div className='button'>Encrypt</div>
                </Button>
            </div>
        );

        let component;
        switch (this.state.component) {
            case 'group':
                component = groupSelection;
                break;
            case 'members':
                component = memberManagement;
                break;
            case 'message':
                component = message;
                break;
            case 'sendmsg':
                component = sendMessage;
                break;
            default:
                component = (<div/>);
                break
        }
        if (this.state.groupSelected === '' && this.state.component !== 'group')
            component = 'Please select group first';
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
                        {this.drawer}
                        <main>
                            <Grid style={{padding: 0}}>
                                <GridCell span="2"/>
                                <GridCell span="12"
                                          style={{textAlign: 'center', marginLeft: '25%', marginRight: '5%'}}>
                                    {component}
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
