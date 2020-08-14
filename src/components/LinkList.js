import React, { Component, Fragment } from 'react'
import Link from './Link'

import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import { LINKS_PER_PAGE } from '../constants'


export const LINKS_QUERY = gql`
  query LinksQuery($first: Int, $skip: Int){
    links(first: $first, skip: $skip) {
      id
      url
      description
      postedBy {
        id
        username
      }
      votes {
        edges {
          node {
            user {
              username
            }
          }
        }
      }
    }
  }
`

const NEW_LINK_SUBSCRIPTION = gql`
  subscription {
    newLink {
      id
      url
      description
    }
  }
`

class LinkList extends Component {
  render() {
    return (
      <Query query={LINKS_QUERY} variables={this._getQueryVariables()}>
        {({ loading, error, data, subscribeToMore }) => {
          if (loading) return <div>Fetching</div>
          if (error) return <div>Error</div>

          this._subscribeToNewLinks(subscribeToMore)

          const linksToRender = this._getLinksToRender(data)
          const isNewPage = this.props.location.pathname.includes('new')
          const pageIndex = this.props.match.params.page
            ? (this.props.match.params.page - 1) * LINKS_PER_PAGE
            : 0

          return (
            <div>
              <Fragment>
                {linksToRender.map((link, index) => <Link key={link.id} link={link} index={index + pageIndex} updateStoreAfterVote={this._updateCacheAfterVote} />)}
                {isNewPage && (
                  <div className="flex ml4 mv3 gray">
                    <div className="pointer mr2" onClick={this._previousPage}>
                      Previous
                    </div>
                    <div className="pointer" onClick={() => this._nextPage(data)}>
                      Next
                    </div>
                  </div>
                )}
              </Fragment>
            </div>
          )
        }}
      </Query>
    )
  }

  _updateCacheAfterVote = (store, createVote, linkId) => {
    const isNewPage = this.props.location.pathname.includes('new')
    const page = parseInt(this.props.match.params.page, 10)

    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0
    const first = isNewPage ? LINKS_PER_PAGE : 100

    const data = store.readQuery({
      query: LINKS_QUERY,
      variables: { first, skip }
    })

    const votedLink = data.links.find(link => link.id === linkId)
    votedLink.votes.edges = createVote.link.votes.edges

    store.writeQuery({ query: LINKS_QUERY, data })
  }


  _getQueryVariables = () => {
    const isNewPage = this.props.location.pathname.includes('new')
    const page = parseInt(this.props.match.params.page, 10)

    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0
    const first = isNewPage ? LINKS_PER_PAGE : 100

    return { first, skip }
  }


  _getLinksToRender = data => {
    const isNewPage = this.props.location.pathname.includes('new')
    if (isNewPage) {
      return data.links
    }

    const rankedLinks = data.links.slice()
    rankedLinks.sort((l1, l2) => l2.votes.edges.length - l1.votes.edges.length)
    return rankedLinks
  }


  _nextPage = data => {
    const page = parseInt(this.props.match.params.page, 10)
    if (data.links.length === LINKS_PER_PAGE) {
      const nextPage = page + 1
      this.props.history.push(`/new/${nextPage}`)
    }
  }


  _previousPage = () => {
    const page = parseInt(this.props.match.params.page, 10)
    if (page > 1) {
      const previousPage = page - 1
      this.props.history.push(`/new/${previousPage}`)
    }
  }


  _subscribeToNewLinks = subscribeToMore => {
    console.log("going in")
    subscribeToMore({
      document: NEW_LINK_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        console.log('subscription');
        if (!subscriptionData.data) return prev
        const newLink = subscriptionData.data.newLink
        const exists = prev.links.find(({ id }) => id === newLink.id)
        if (exists) return prev;

        return Object.assign({}, prev, {
          links: [newLink, ...prev.links],
          __typename: prev.__typename
        })
      }
    })
  }
}

export default LinkList