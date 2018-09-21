import React, {Component} from 'react'
import {Button, TextField} from "rmwc";

class SendMessage extends Component {
    constructor(props) {
        super(props);
        this.encryptButton = React.createRef();
    }

    state = {
        encryptInput: ''
    };

    changeEncryptInput = (event) => {
        this.setState({
            encryptInput: event.target.value
        })
    };

    handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            this.encryptButton.current.click();
            this.encryptButton.current.focus();
        }
    };

    render() {
        return (
            <div>
                <TextField
                    textarea
                    fullwidth
                    rows='6'
                    label='Encrypt a document'
                    value={this.state.encryptInput}
                    onChange={this.changeEncryptInput}
                    onKeyPress={this.handleKeyPress}
                />
                <br/>
                <Button
                    raised
                    elementRef={this.encryptButton}
                    onClick={() => {
                        this.props.encrypt(this.state.encryptInput)
                            .then(() => {
                                this.encryptButton.current.blur();
                                this.setState({
                                    encryptInput: ''
                                })
                            })
                    }}
                >
                    <div className='button'>Encrypt</div>
                </Button>
            </div>
        )
    }
}

export default SendMessage