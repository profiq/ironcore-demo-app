import React, {Component} from 'react'
import {Drawer, DrawerContent, DrawerHeader, Icon, ListItem, ListItemText} from "rmwc";

class NavMenu extends Component {
    render() {
        return (
            <Drawer permanent style={{height: '100%', position: 'fixed'}}>
                <DrawerHeader>
                    <ListItem onClick={() => {
                        this.props.loadData()
                    }}>
                        <Icon use='refresh'/>
                    </ListItem>
                </DrawerHeader>
                <DrawerContent>
                    <ListItem onClick={() => {
                        this.props.changeMenuItem('group')
                    }}>
                        <ListItemText>
                            Group selection
                        </ListItemText>
                    </ListItem>
                    <ListItem onClick={() => {
                        this.props.changeMenuItem('members')
                    }}>
                        <ListItemText>
                            Group management
                        </ListItemText>
                    </ListItem>
                    <ListItem onClick={() => {
                        this.props.changeMenuItem('message')
                    }}>
                        <ListItemText>
                            Messages
                        </ListItemText>
                    </ListItem>
                    <ListItem onClick={() => {
                        this.props.changeMenuItem('sendmsg')
                    }}>
                        <ListItemText>
                            Send Message
                        </ListItemText>
                    </ListItem>
                </DrawerContent>
            </Drawer>
        )
    }

}

export default NavMenu