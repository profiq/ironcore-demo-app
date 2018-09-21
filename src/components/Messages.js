import React, {Component} from 'react'
import {Button, List, ListItem, ListItemText} from "rmwc";
import ReactTooltip from "react-tooltip";

class Messages extends Component {
    constructor(props) {
        super(props);
        this.decryptAllButton = React.createRef();
    }

    docSort = (docA, docB) => {
        if (docA.order < docB.order) return -1;
        if (docA.order > docB.order) return 1;
        return 0
    };

    render() {
        return (
            <div>
                {this.props.documentListGroup.length ?
                    <Button
                        raised
                        elementRef={this.decryptAllButton}
                        onClick={() => {
                            this.props.decrypt({}, true)
                                .then(() => {
                                    this.decryptAllButton.current.blur();
                                })
                        }}
                    >
                        <div className='button'>Decrypt All</div>
                    </Button>
                    : 'There are no messages yet'}
                <List>
                    {
                        this.props.documentListGroup.sort(this.docSort).map((document) => {
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
                                            this.props.decrypt(document.documentID, false);
                                        }}
                                    >
                                        <div className='button'>Decrypt</div>
                                    </Button>
                                    {' '}
                                    <Button
                                        raised
                                        onClick={() => {
                                            this.props.delete(document.documentID);
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
        )
    }
}

export default Messages