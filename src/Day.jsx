import React, { useEffect, useState } from "react";
import './Day.css';

let tempId = Date.now();

function TodoList({ list, handleCheckChange, listClick, deleteButton, isCompleted }) {
    const formatTime = (timeString) => {
        const options = { hour: 'numeric', minute: 'numeric' };
        return new Date(timeString).toLocaleTimeString(undefined, options);
    };
    return (
        <ul className="boxbox">
            {list && list.map((item, index) => (

                <li className="listFrom" key={item.id} onClick={() => listClick(index, isCompleted)}>
                    <input
                        type="checkbox" className='check'
                        checked={item.completed}
                        onChange={() => handleCheckChange(item, index, item.completed)}
                    />
                    <a href="#" >{item.title}</a>
                    <button className="dbt" onClick={(e) => {
                        e.stopPropagation();
                        deleteButton(index, isCompleted);
                    }}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    <a>{formatTime(item.checkTime)}</a>
                </li>
            ))}
        </ul>
    );
}

function Day({ isD }) {
    const [showWrite, setShowWrite] = useState(false);
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [incompleteList, setIncompleteList] = useState([]);
    const [completedList, setCompletedList] = useState([]);
    const [dateTime, setDateTime] = useState("");
    const [sortOrder, setSortOrder] = useState('asc');

    useEffect(() => {
        if (isD) {
            setShowWrite(false)
        } else {
            setShowWrite(false)
        }
    }, [isD])

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
        setDateTime(formatDateTime(list[index].checkTime))
    };

    const formatDateTime = (dateTime) => {
        // 문자열 형태의 날짜 그대로 반환
        return dateTime || "";
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
    const dateTimeHandler = (event) => {
        setDateTime(event.target.value + ":00");
    };

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
                    result.incompleteItems.sort((a, b) => new Date(a.checkTime).getTime() - new Date(b.checkTime).getTime());
                    result.completedItems.sort((a, b) => new Date(a.checkTime).getTime() - new Date(b.checkTime).getTime());
                    setIncompleteList(result.incompleteItems);
                    setCompletedList(result.completedItems);
                    console.log(result);
                } else {
                    console.error(`HTTP 오류 발생: ${response.status}`);
                }
            } catch (error) {
                console.error('오류 발생:', error);
            }
        };

        fetchData();
    }, [showWrite]);

    // 달력선택값
    const [selectedDate, setSelectedDate] = useState('');

    const callHandler = (event) => {
        const selectedDate = event.target.value;
        setSelectedDate(selectedDate);
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:8080/itemlist?maindate=${selectedDate}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });
                console.log(selectedDate);
                if (response.ok) {
                    const result = await response.json();
                    result.incompleteItems.sort((a, b) => new Date(a.checkTime).getTime() - new Date(b.checkTime).getTime());
                    result.completedItems.sort((a, b) => new Date(a.checkTime).getTime() - new Date(b.checkTime).getTime());
                    setIncompleteList(result.incompleteItems);
                    setCompletedList(result.completedItems);
                    console.log(result);
                } else {
                    console.error(`HTTP 오류 발생: ${response.status}`);
                }
            } catch (error) {
                console.error('오류 발생:', error);
            }
        };

        fetchData();  // useEffect 내부에서 fetchData 호출
    }, [selectedDate]);  // useEffect에 selectedDate를 의존성으로 추가


    const saveButton = async () => {
        if (title.trim() === "" || content.trim() === "") {
            alert("제목과 내용을 작성해주세요.");
            return;
        }

        const data = {
            title: title,
            content: content,
            time: dateTime
        };

        try {
            const response = await fetch('http://localhost:8080/item', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                console.log("저장에 성공했습니다.");
                const result = await response.json();
                const savedTodo = result.todo;

                updateList(savedTodo, incompleteList, setIncompleteList);
            } else {
                console.log("저장 중 오류가 발생했습니다.");
            }
        } catch (error) {
            console.error('오류 발생:', error);
        }
    };

    const updateList = (updatedItem, list, setList) => {
        setList((prevList) => {
            const newList = [...prevList];
            const index = newList.findIndex(item => item.id === tempId);

            if (index !== -1) {
                newList[index].id = updatedItem.id;
                newList[index].title = updatedItem.title;
                newList[index].content = updatedItem.content;
                newList[index].temporary = false;
            }

            return newList;
        });

        tempId = Date.now();
        setShowWrite(false);
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
        // 체크 여부에 따라 소스 및 타겟 리스트를 갱신
        const updatedSourceList = isChecked ? completedList : incompleteList;
        const updatedTargetList = isChecked ? incompleteList : completedList;
        const setSourceList = isChecked ? setCompletedList : setIncompleteList;
        const setTargetList = isChecked ? setIncompleteList : setCompletedList;

        // 업데이트된 아이템 생성
        const updatedItem = { ...item, completed: !isChecked, checkTime: new Date() };
        // 소스 리스트에서 업데이트된 아이템 제거
        const updatedList = updatedSourceList.filter((_, i) => i !== index);

        // 소스 리스트 갱신
        setSourceList(updatedList);

        // 데이터베이스에 PUT 요청 보내기
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

        // 타겟 리스트 갱신
        setTargetList((prevList) => {
            // 새로운 아이템 추가
            const tempList = [...prevList, updatedItem];

            // 데이터베이스에서 최신 데이터를 비동기적으로 불러오기
            const fetchData = async () => {
                try {
                    const response = await fetch('http://localhost:8080/itemlist', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                    });

                    if (response.ok) {
                        // 최신 데이터로 미완료 및 완료 리스트 정렬 및 갱신
                        const result = await response.json();
                        result.incompleteItems.sort((a, b) => new Date(a.checkTime) - new Date(b.checkTime));
                        result.completedItems.sort((a, b) => new Date(a.checkTime) - new Date(b.checkTime));
                        setIncompleteList(result.incompleteItems);
                        setCompletedList(result.completedItems);
                    } else {
                        console.error(`HTTP 오류 발생: ${response.status}`);
                    }
                } catch (error) {
                    console.error('오류 발생:', error);
                }
            };

            // 비동기적으로 데이터베이스에서 최신 데이터를 불러온 후 정렬 수행
            fetchData().then(() => {
                console.log('Before Sort:', prevList);
                console.log('After Sort:', tempList);

                // 정렬
                tempList.sort((a, b) => {
                    const dateA = new Date(a.checkTime);
                    const dateB = new Date(b.checkTime);
                    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
                });

                return tempList;
            });
        });
    };


    return (

        <div className="wrap">
            <div>
                <input className="mainDate" type="date" onChange={callHandler}></input>
            </div>
            <div className="container">
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
                <div className="article">
                    {showWrite && (
                        <>
                            <input className="title" type="text" placeholder="Title" value={title} onChange={titleHandler} />
                            <br />
                            <input className="date" type="datetime-local" placeholder="날짜와 시간을 입력해주세요." value={dateTime} onChange={dateTimeHandler} />
                            <br />
                            <textarea className="content" value={content} onChange={contentHandler} />
                        </>
                    )}
                </div>
                <div className="addBtForm">
                    {!showWrite ? (
                        <button className="addbt" onClick={addEmptyItem}><i class="fa-solid fa-plus"></i></button>
                    ) : (
                        <>
                            <div className="btset">
                                <button id="canclebt" onClick={cancelButton}>취소</button>
                                <button id="savebt" onClick={saveButton}>저장</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
export default Day;