import React, { useState } from 'react'
import { withApollo } from 'react-apollo'
import gql from 'graphql-tag'
import Link from './Link'


const SEARCH_QUERY = gql`
  query SearchQuery($search:String!) {
    links(search: $search) {
      id
      url
      description
      postedBy {
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

const Search = (props) => {
  const [links, setLinks] = useState([]);
  const [filter, setFilter] = useState('');


  const executeSearch = async () => {
    const search = filter

    try {
      const result = await props.client.query({
        query: SEARCH_QUERY,
        variables: { search },
      })
    } catch (e) {
      console.log(e.message)
    }

    const filteredLinks = result.data.links
    setLinks(filteredLinks)
  }

  return (
    <div>
      <div>
        Search
        <input
          type='text'
          onChange={e => setFilter(e.target.value)}
        />
        <button onClick={() => executeSearch()}>OK</button>
        {links.map((link, index) => (
          <Link key={link.id} link={link} index={index} />
        ))}
      </div>
    </div>
  )
}


export default withApollo(Search)