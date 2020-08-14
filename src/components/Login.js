import React, { useState } from 'react'
import { AUTH_TOKEN } from '../constants'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'


const LOGIN_MUTATION = gql`
  mutation LoginMutation($username:String!, $password:String!){
    tokenAuth(username: $username, password: $password) {
      token
    }
  }
`


const SIGNUP_MUTATION = gql`
  mutation SignupMutation($username: String!, $password: String!, $email:String!){
    createUser(username: $username, password: $password, email: $email){
      user {
        username
        email
      }
    }
  }
`


const Login = (props) => {
  const [login, setLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleConfirmation = async data => {
    if (!login) {
      setLogin(!login)
      return
    } else {
      const { token } = data.tokenAuth
      saveUserData(token)
      props.history.push('/')
    }
  }

  const saveUserData = token => {
    localStorage.setItem(AUTH_TOKEN, token)
  }

  return (
    <div>
      <h4 className="mv3">{login ? 'Login' : 'Signup'}</h4>
      <div className="flex flex-column">
        {!login && (
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            type="text"
            placeholder="Email"
          />
        )}
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          type="text"
          placeholder="Username"
        />
        <input
          value={password}
          onChange={e => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
        />
      </div>
      <div className="flex mt3">
        <Mutation
          mutation={login ? LOGIN_MUTATION : SIGNUP_MUTATION}
          variables={{ email, password, username }}
          onCompleted={data => handleConfirmation(data)}
        >
          {mutation => (
            <div className="pointer mr2 button" onClick={mutation}>
              {login ? 'login' : 'create account'}
            </div>
          )}
        </Mutation>
        <div className="pointer button" onClick={() => setLogin(!login)}>
          {login ? 'need to create an account?' : 'already have an account?'}
        </div>
      </div>
    </div>
  )

}


export default Login