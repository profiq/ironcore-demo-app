import React, {Component} from 'react'
import {Typography, TextField, Button, Snackbar} from 'rmwc'

class Login extends Component {
    state = {
        username: '',
        password: '',
        snackbar: ''
    }

    handleUsernameChange = (event) => {
        this.setState({
            username: event.target.value
        })
    }

    handlePasswordChange = (event) => {
        this.setState({
            password: event.target.value
        })
    }

    render() {
        return (
            <div style={{marginTop: '15%'}} align='center'>
                <Typography use='headline3'>
                    profiq IronCore
                </Typography>
                <br/>
                <TextField onChange={this.handleUsernameChange} label='Username' value={this.state.username}/>
                <br/>
                <TextField onChange={this.handlePasswordChange} type='password' label='Password'
                           value={this.state.password}/>
                <br/>
                <br/>
                <Button raised onClick={() => {
                    this.props.login(this.state.username, this.state.password)
                        .catch(() => {
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