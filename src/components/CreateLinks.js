import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import { LINKS_QUERY } from './LinkList'
import { LINKS_PER_PAGE } from '../constants'


const LINK_MUTATION = gql`
  mutation PostMutation($description: String!, $url: String!) {
    createLink(description: $description, url: $url) {
      id
      url
      description
      postedBy {
        id
        username
      }
    }
  }
`

class CreateLink extends Component {
  state = {
    description: '',
    url: '',
  }

  render() {
    const { description, url } = this.state
    return (
      <div>
        <div className="flex flex-column mt3">
          <input
            className="mb2"
            value={description}
            onChange={e => this.setState({ description: e.target.value })}
            type="text"
            placeholder="A description for the link"
          />
          <input
            className="mb2"
            value={url}
            onChange={e => this.setState({ url: e.target.value })}
            type="text"
            placeholder="The URL for the link"
          />
        </div>
        <Mutation
          mutation={LINK_MUTATION}
          variables={{ description, url }}
          onCompleted={() => this.props.history.push('/new/1')}
          update={(store, { data: { createLink } }) => {
            createLink = {
              ...createLink,
              votes: {
                edges: []
              }
            }
            const first = LINKS_PER_PAGE
            const skip = 0
            const data = store.readQuery({
              query: LINKS_QUERY,
              variables: { first, skip }
            });
            data.links.unshift(createLink)
            store.writeQuery({
              query: LINKS_QUERY,
              data,
              variables: { first, skip }
            })
          }}
        >
          {postMutation => <button onClick={postMutation}>Submit</button>}
        </Mutation>
      </div>
    )
  }
}

export default CreateLink