import React, { Component } from 'react';
import { API, graphqlOperation } from "aws-amplify";
import { listTodos } from './graphql/queries';
import { createTodo } from './graphql/mutations';
import { onCreateTodo } from './graphql/subscriptions';

class App extends Component {



  state = {
    todos: [],
    title: "",
    content: ""
  }

  async componentDidMount() {
    try {
      const todos = await API.graphql(graphqlOperation(listTodos))
      console.log('todos: ', todos)
      this.setState({ todos: todos.data.listTodos.items })
    } catch (e) {
      console.log(e)
    }

    API.graphql(graphqlOperation(onCreateTodo)).subscribe({
      next: (eventData) => {
        console.log('eventData: ', eventData)
        const todo = eventData.value.data.onCreateTodo
        const todos = [...this.state.todos.filter(content => {
          return (content.title !== todo.title)
        }), todo]
        this.setState({ todos })
      }
    })
  }

  createTodo = async () => {
    // バリデーションチェック
    if (this.state.title === '' || this.state.content === '') return

    // 新規登録 mutation
    const createTodoInput = {
      title: this.state.title,
      content: this.state.content
    }

    // 登録処理
    try {
      const todos = [...this.state.todos, createTodoInput]
      this.setState({ todos: todos, title: "", content: "" })
      await API.graphql(graphqlOperation(createTodo, { input: createTodoInput }))
      console.log('createTodoInput: ', createTodoInput)
    } catch (e) {
      console.log(e)
    }
  }

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  render() {
    return (
      <div className="App">
        <div>
          タイトル
        <input value={this.state.title} name="title" onChange={this.onChange}></input>
        </div>
        <div>
          内容
        <input value={this.state.content} name="content" onChange={this.onChange}></input>
        </div>
        <button onClick={this.createTodo}>追加</button>
        {this.state.todos.map((todo,idx) => {return <div key={idx}><div><br></br>タイトル: {todo.title}</div><div>内容: {todo.content}</div><br></br></div>})}
      </div>
    )
  }
}

export default App;