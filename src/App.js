import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import PropTypes from 'prop-types';
import { sortBy } from 'lodash';
import classNames from 'classnames';

const DEFAULT_QUERY = 'react';
const DEFAULT_HPP = '100';
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';


function isSearched(searchTerm){
  return function(item){
    return item.title.toLowerCase().includes(searchTerm.toLowerCase());
  }
}

class App extends Component {
  constructor(props){
    super(props);
    {/*const robin = new Developer('Robin', 'Wieruch');*/}
    this.state = {results:null,
      searchKey:'',
      searchTerm:DEFAULT_QUERY,
      error:null,
      isLoading:false,
      sortKey:'NONE',
      isSortReverse: false,
    };
    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
  }
  /*onSort(sortKey){
    const isSortReverse = this.state.sortKey ===sortKey && !this.state.isSortReverse;
    this.setState({sortKey,isSortReverse})
  }*/
  needsToSearchTopStories(searchTerm){
    return !this.state.results[searchTerm];
  }
  setSearchTopStories(result){
    this.setState(preState=>{
      const {hits,page} = result;
      const {searchKey,results} = preState;
      const oldHits = results && results[searchKey] ? results[searchKey].hits : [];
      const updateHits = [...oldHits,...hits];
      return{results:{...results,[searchKey]:{hits:updateHits,page}},isLoading:false};
    });

  }
  fetchSearchTopStories(searchTerm,page = 0){
    this.setState({isLoading:true});
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
    .then(response => response.json())
    .then(result =>this.setSearchTopStories(result))
    .catch(e=>this.setState({error:e}));
  }
  componentDidMount(){
    const {searchTerm} = this.state;
    this.setState({searchKey:searchTerm});
    this.fetchSearchTopStories(searchTerm);
  }
  onSearchChange(event){
    {/*console.log(event.target.value)*/}
    this.setState({searchTerm: event.target.value});
  }
  onSearchSubmit(event){
    const {searchTerm} = this.state;
    this.setState({searchKey:searchTerm});
    if (this.needsToSearchTopStories(searchTerm)){
      this.fetchSearchTopStories(searchTerm);
    }
    event.preventDefault();
  }
  onDismiss(id){
    const {searchKey,results} = this.state;
    const {hits,page} = results[searchKey];
    const isNotId = item => item.objectID !==id;
    const updateHits = hits.filter(isNotId);
    /*const updateList = this.state.result.hits.filter(
      function isNotId(item){
        return item.objectID !== id;
      }
    );
    const updateHits = {hits:updateList};
    const updateResult = Object.assign({},this.state.result,updateHits)*/
    this.setState({results:{...results,[searchKey]:{hits:updateHits,page}}});
  }

  render() {
    const {searchTerm,
      results,
      searchKey,
      error,
      isLoading,
    } = this.state;
    /*if(error){
      return <p>Something went wrong.</p>
    }*/
    const page = (results && results[searchKey] && results[searchKey].page)||0;
    const list = (results && results[searchKey] && results[searchKey].hits)||[];
    return (
      <div className = 'page'>
        <div className = 'interactions'>
          <Search value = {searchTerm}
                  onChange = {this.onSearchChange}
                  onSubmit = {this.onSearchSubmit}>search </Search>
        </div>
          {error ?<div className="interactions"> <p>Something went wrong.</p> </div>
                 : <Table list = {list}
                          onDismiss = {this.onDismiss}/>}
        <div className = 'interactions'>
          <ButtonWithLoading isLoading = {isLoading}
                             onClick = {()=> this.fetchSearchTopStories(searchKey,page+1)}>
                             More
          </ButtonWithLoading>
        </div>
      </div>

    );
  }
}
/*class Search extends Component{
  render(){
    const{value,onChange,children} = this.props;
    return (
      <form>
        {children}<input type ='text' value = {value} onChange = {onChange}/>
      </form>
    );
  }
}*/


class Search extends Component{
  componentDidMount(){
    if(this.input){
      this.input.focus();
    }
  }
  render(){
    const{value,onChange,children,onSubmit} = this.props;

    return (
      <form onSubmit= {onSubmit}>
        <input type ='text' value = {value}
               onChange = {onChange}
               ref = {(node)=>{this.input = node}}
        />
        <button type = 'submit' >{children}
        </button>
      </form>
    );
  }
}
class Table extends Component{
  constructor(props){
    super(props);
    {/*const robin = new Developer('Robin', 'Wieruch');*/}
    this.state = {
      sortKey:'NONE',
      isSortReverse: false,
    };
    this.onSort = this.onSort.bind(this);
  }
  onSort(sortKey){
    const isSortReverse = this.state.sortKey ===sortKey && !this.state.isSortReverse;
    this.setState({sortKey,isSortReverse})
  }
  render(){
    const {list,onDismiss} = this.props;
    const {sortKey,onsort,isSortReverse} = this.state;
    const sortedList = SORTS[sortKey](list);
    const reversedSortedList = !isSortReverse ?
                                sortedList :
                                sortedList.reverse();
    return(
        <div className="table">
            <div className = 'table-header'>
              <span style = {{ width: '40%' }}>
              <Sort sortKey = {'TITLE'}
                    onSort= {this.onSort}
                    activeSortKey={sortKey}>
                    Title
              </Sort>
              </span>
              <span style = {{ width: '30%' }}>
              <Sort sortKey = {'AUTHOR'}
                    onSort= {this.onSort}
                    activeSortKey={sortKey}>
                    Author
              </Sort>
              </span>
              <span style = {{ width: '10%' }}>
              <Sort sortKey = {'COMMENTS'}
                    onSort= {this.onSort}
                    activeSortKey={sortKey}>
                    Comments
              </Sort>
              </span>
              <span style = {{ width: '10%' }}>
              <Sort sortKey = {'POINTS'}
                    onSort= {this.onSort}
                    activeSortKey={sortKey}>
                    Points
              </Sort>
              </span>
              <span style = {{ width: '10%' }}>
              Archive
              </span>
            </div>
            {reversedSortedList.map(item =>
            <Row key={item.objectID}
                 objectID = {item.objectID}
                 url = {item.url}
                 title ={item.title}
                 author = {item.author}
                 num_comments = {item.num_comments}
                 points = {item.points}
                 onDismiss = {onDismiss}
                 />
          )}
        </div>
      );
      Table.propTypes = {
        list:PropTypes.array.isRequired,
        onDismiss:PropTypes.func.isRequired,
      }
    }
}
function Row({objectID,url,title,author,num_comments,points,onDismiss}) {
    return(
      <div className="table-row">
        <span style={{ width: '40%' }}>
          <a href = {url}>{title}</a>
        </span>
        <span style={{ width: '30%' }}>{author}</span>
        <span style={{ width: '10%' }}>{num_comments}</span>
        <span style={{ width: '10%' }}>{points}</span>
        <span style={{ width: '10%' }}>
          <Button onClick = {() => onDismiss(objectID)} className="button-inline">
          Dissmiss</Button>
        </span>
        </div>
    );
}
const Button = ({onClick,className = '',children }) =>

      <button onClick = {onClick} className = {className} type = 'button'>
      {children}
      </button>

      Button.propTypes = {
        onClick:PropTypes.func.isRequired,
        className:PropTypes.string,
        children:PropTypes.node.isRequired,
      };
const Loading = () =>
        <div>Loading ...</div>

const withLoading =(Component)=> ({isLoading,...rest})=>
        isLoading ? <Loading/> : <Component {...rest}/>

const ButtonWithLoading = withLoading(Button);

const SORTS ={NONE:list => list,
             TITLE:list =>sortBy(list,'title'),
             AUTHOR:list => sortBy(list,'author'),
             COMMENTS:list => sortBy(list,'num_comments').reverse(),
             POINTS:list => sortBy(list,'points').reverse(),
           }

const Sort = ({sortKey,onSort,children,activeSortKey})=>{
      const sortedClass = classNames(
        'button-inline',
        {'button-active':sortKey===activeSortKey}
      );
      return(
        <Button onClick = {()=>onSort(sortKey)}
                className={sortedClass} >
                {children}
        </Button>
     );
}
export default App;
