import React, {useEffect, useRef, useState} from "react";
import {io} from 'socket.io-client';

const socket = io("https://cocktail-bot.azurewebsites.net");
socket.on('connect', () => {
    console.log('Connected to the socket');
});

socket.on('disconnect', () => {
    console.log('Disconnected from the socket');
});


function Chatbot() {
  return (
      <div>
        <Header />
        <div className="chat-body container-fluid">
          <Chat />
        </div>
      </div>
  )
}

function Header() {
  return (
      <header className="header">
        <div className="container-fluid px-5">
          <div className="row justify-content-between py-3">
            <div className="col-sm-3 d-flex allign-items-center justify-content-center">
              <img src="./img/Logo.png" alt="logo"/>
              <div className="d-flex flex-column">
                <h1>Cocktail</h1>
                <h2>Chat</h2>
              </div>
            </div>
            <div className="col-sm-1 d-flex align-items-center justify-content-center me-5">
              <button className="about-button btn">
                About
              </button>
            </div>
          </div>
        </div>
      </header>
  )
}

function Chat() {
  const [messages, setMessages] = useState([{
    text: "Hi! I am a cocktail bot! Type 'help; to get the list of available commands.",
    sender: "bot"
  }])


  function onSubmit(text) {

    if (text) {

        socket.emit('question', text);
        socket.on('answer', (result) => {
            setMessages([...messages, {text: text, sender: "user"}, {text: result, sender: "bot"}]);
        });
    }
  }

  return (
      <div className="chat-window card mx-auto">
        <div className="card-header bg-transparent">
          <div className="navbar navbar-expand p-0">
            <ul className="navbar-nav me-auto align-items-center">
              <li className="nav-item">
                <div className="position-relative avatar">
                  <img src="./img/avatar.png"
                       className="img-fluid rounded-circle" alt="avatar"/>
                  <div
                      className="position-absolute bottom-0 start-100 translate-middle p-1 bg-success border border-light rounded-circle">
                  </div>
                </div>
              </li>
              <li className="nav-item mx-3">
                Bartender Champion
              </li>
            </ul>
          </div>
        </div>
        <MessageArea messages={messages}/>
        <UserInput onSubmit={onSubmit}/>
      </div>
  )
}

function MessageArea(props) {
    const messagesEndRef = useRef(null)

    useEffect(() => {
        if (props.messages.length > 1) {
            scrollToBottom();
        }
    })

    function scrollToBottom() {
        messagesEndRef.current.scrollIntoView({behavior: "smooth"})
    }
  return (
      <div className="card-body p-4" id="chat-window">
        {props.messages.map(msg => (<Message text={msg.text} sender={msg.sender}/>))}
          <div ref={messagesEndRef}/>
      </div>
  )
}

function Message(props) {
  if (props.sender === "bot") {
    return (
        <div className="d-flex align-items-baseline mb-4">
          <div className="position-relative avatar">
            <img src="./img/avatar.png"
                 className="img-fluid rounded-circle" alt="avatar"/>
            <div className="position-absolute bottom-0 start-100 translate-middle p-1 bg-success border border-light rounded-circle" />
          </div>
          <div className="pe-2">
            <div className="card d-inline-block p-1 ms-2 bot-message">
              {props.text}
            </div>
          </div>
        </div>
    )
  }
  else if (props.sender === "user") {
    return (
        <div className="pe-2 d-flex justify-content-end mb-4">
          <div className="card d-inline-block p-1 user-message">
            {props.text}
          </div>
        </div>
    )
  }
}

function UserInput(props) {
    const [input, setInput] = useState("");
    function handleSend() {
        props.onSubmit(input);
        setInput("");
    }

    function handleChange(e) {
        setInput(e.target.value);
    }

    function handleKeyPress(e) {
        if (e.key === "Enter") {
            handleSend();
        }
    }


  return (
      <div className="card-footer bg-transparent w-100 p-0">
        <div className="input-group bg-transparent py-0">
          <input type="text" className="form-control border-0 ps-1 bg-transparent"
                 placeholder="Write a message..."
                 value={input}
                 onChange={handleChange}
                 onKeyPress={handleKeyPress}
                 id="message-text"/>
          <div className="input-group-text border-0 bg-transparent">
            <button className="send-message-btn btn btn-success text-secondary bg"
                    id="send-message-btn"
                    onClick={handleSend}>
              <i className="fa-solid fa-paper-plane" style={{ color: '#ffffff' }}/>
            </button>
          </div>
        </div>
      </div>
  )
}

export default Chatbot;
