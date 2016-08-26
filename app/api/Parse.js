import notFalsy from 'lodash/identity'

function Parse ({ selectedUrl$ }) {
  const request$ = selectedUrl$.filter(notFalsy).map(url => ({
    url: '/api/parse',
    method: 'POST',
    type: 'application/json',
    progress: false,
    category: 'parse',
    send: {
      url: url,
      depth: 2
    }
  }))
  return {
    HTTP: request$
  }
}

export default Parse
