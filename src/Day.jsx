import React, { useEffect, useState } from "react";

let tempId = Date.now(); //임시아이디 값

function TodoList({ list, handleCheckChange, listClick, deleteButton, isCompleted }) {
    return (
        <ul>
            {list.map((item, index) => (
                <li key={item.id}>
                    <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleCheckChange(item, index, item.completed)}
                    />
                    <a href="#" onClick={() => listClick(index, isCompleted)}>{item.title}</a>
                    <button onClick={(e) => {
                        e.stopPropagation();
                        deleteButton(index, isCompleted);
                    }}>
                        삭제
                    </button>
                </li>
            ))}
        </ul>
    );
}

function Day() {
    const [showWrite, setShowWrite] = useState(false);
    const [title, setTitle] = useState("")
    const [time, setTime] = useState("")
    const [content, setContent] = useState("")
    const [incompleteList, setIncompleteList] = useState([]);
    const [completedList, setCompletedList] = useState([]);

    const addEmptyItem = () => {
        const newItem = {
            id: tempId++,
            title: "ToDoList",
            content: "",
            temporary: true,
        };
        setIncompleteList((prevList) => [...prevList, newItem]);
    };

    const listClick = (index, isCompleted) => {
        const list = isCompleted ? completedList : incompleteList;

        setShowWrite(true)
        setTitle(list[index].title)
        setContent(list[index].content)
    };

    const cancelButton = () => {
        setShowWrite(false)
    };

    const titleHandler = (event) => {
        setTitle(event.target.value);
    }
    const contentHandler = (event) => {
        setContent(event.target.value);
    }
    const timeHandler = (event) => {
    setTime(event.target.value);
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:8080/itemlist', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });
                if (response.ok) {
                    const result = await response.json();
                    setIncompleteList(result.incompleteItems);
                    setCompletedList(result.completedItems);
                } else {
                    console.error(`HTTP 오류 발생: ${response.status}`);
                }
            } catch (error) {
                console.error('오류 발생:', error);
            }
        };

        fetchData();
    }, [showWrite]);

    const saveButton = async () => {
        if (title.trim() === "" || content.trim() === "") {
            alert("제목과 내용을 작성해주세요.")
            return;
        }

        const data = {
            title: title,
            content: content,
            time: time
        };

        try {
            const response = await fetch('http://localhost:8080/item', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            if (response.ok) {
                console.log(response);
                console.log("저장에 성공했습니다.");
                setShowWrite(false);
        
                const result = await response.json();
                const savedTodo = result.todo;
        
                setIncompleteList(prevList => {
                    const newList = [...prevList];
                    const index = newList.findIndex(item => item.id === tempId);
                    if (index !== -1) {
                        newList[index].id = savedTodo.id;
                        newList[index].title = savedTodo.title;
                        newList[index].content = savedTodo.content;
                        newList[index].temporary = false
                    }
                    return newList;
                });
                tempId = Date.now();
                console.log("저장에 성공했습니다.");
                setShowWrite(false);
            } else {
                console.log("저장 중 오류가 발생했습니다.");
            }
        } catch (error) {
            console.error('오류 발생:', error);
        }
    };

    const deleteButton = async (index, isCompleted) => {
        const list = isCompleted ? completedList : incompleteList;
        const setFunc = isCompleted ? setCompletedList : setIncompleteList;

        const updatedList = list.filter((_, i) => i !== index);
        setFunc(updatedList);

        const item = list[index];
        if (!item.temporary) {
            try {
                const response = await fetch(`http://localhost:8080/item/${item.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });
                if (response.ok) {
                    console.log("삭제에 성공했습니다.");
                } else {
                    console.log("삭제 중 오류가 발생했습니다.");
                }
            } catch (error) {
                console.error('오류 발생:', error);
            }
        }
    };

    const handleCheckChange = async (item, index, isChecked) => {
        const updatedSourceList = isChecked ? completedList : incompleteList;
        const updatedTargetList = isChecked ? incompleteList : completedList;
        const setSourceList = isChecked ? setCompletedList : setIncompleteList;
        const setTargetList = isChecked ? setIncompleteList : setCompletedList;

        const updatedItem = { ...item, completed: !isChecked };
        const updatedList = updatedSourceList.filter((_, i) => i !== index);

        setSourceList(updatedList);
        setTargetList([...updatedTargetList, updatedItem]);

        if (!item.temporary) {
            try {
                const response = await fetch(`http://localhost:8080/put/${item.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedItem)
                });
                if (!response.ok) {
                    throw new Error(`HTTP 오류 발생: ${response.status}`);
                }
            } catch (error) {
                console.error('오류 발생:', error);
            }
        }
    };

    return (
        <div>
            <div>
                {!showWrite && (
                    <>
                        <TodoList
                            list={incompleteList}
                            handleCheckChange={handleCheckChange}
                            listClick={listClick}
                            deleteButton={deleteButton}
                            isCompleted={false}
                        />
                        <TodoList
                            list={completedList}
                            handleCheckChange={handleCheckChange}
                            listClick={listClick}
                            deleteButton={deleteButton}
                            isCompleted={true}
                        />
                    </>
                )}
                {showWrite && (
                    <>
                        <input type="text" placeholder="Title" value={title} onChange={titleHandler} />
                        <br />
                        <input type="date" placeholder="시간을 입력해주세요." value={time} onChange={timeHandler} />
                        <textarea value={content} onChange={contentHandler} />
                    </>
                )}

                <div>
                    {!showWrite ? (
                        <button onClick={addEmptyItem}>+</button>
                    ) : (
                        <>
                            <button onClick={cancelButton}>취소</button>
                            <button onClick={saveButton}>저장</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
export default Day;