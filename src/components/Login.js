import React, {Component} from 'react'
import {Typography, TextField, Button, Snackbar} from 'rmwc'

class Login extends Component {
    constructor(props) {
        super(props);
        this.loginButton = React.createRef();
    }

    state = {
        username: '',
        password: '',
        snackbar: ''
    };

    handleUsernameChange = (event) => {
        this.setState({
            username: event.target.value
        })
    };

    handlePasswordChange = (event) => {
        this.setState({
            password: event.target.value
        })
    };

    handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            this.loginButton.current.click();
            this.loginButton.current.focus();
        }
    };

    render() {
        return (
            <div style={{marginTop: '15%'}} align='center'>
                <Typography use='headline3'>
                    profiq IronCore
                </Typography>
                <br/>
                <TextField onChange={this.handleUsernameChange} onKeyPress={this.handleKeyPress} label='Username'
                           value={this.state.username}/>
                <br/>
                <TextField onChange={this.handlePasswordChange} onKeyPress={this.handleKeyPress} type='password'
                           label='Password'
                           value={this.state.password}/>
                <br/>
                <br/>
                <Button raised elementRef={this.loginButton} onClick={() => {
                    this.props.login(this.state.username, this.state.password)
                        .catch(() => {
                            this.loginButton.current.blur();
                            this.setState({
                                snackbar: 'Problem occured, please log again',
                                username: '',
                                password: ''
                            })
                        })
                }}>
                    <div className='button'>Login</div>
                </Button>
                <Snackbar
                    show={this.state.snackbar !== ''}
                    timeout={3000}
                    message={this.state.snackbar}
                    onHide={() => {
                        this.setState({
                            snackbar: ''
                        })
                    }}
                />
            </div>
        )
    }
}

export default Login