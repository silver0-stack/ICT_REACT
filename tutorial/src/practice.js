// 학습 내용
/*
컴포넌트를 만들고 중첩하는 법
마크업과 스타일을 추가하는 법
데이터를 표시하는 법
조건과 리스트를 렌더링하는 법
이벤트에 응답하고 화면을 업데이트 하는 법
컴포넌트 간에 데이터 공유하는 법
*/ 
import React from 'react';

// 리액트 앱은 컴포넌트로 구성됨. 컴포넌트는 고유한 로직과 모양을 가진 UI의 일부다. 
// 컴포넌트는 버튼만큼 작을 수도, 전체 페이지만큼 클 수도 있다.
function MyButton(){
    return (
        <button>I'm a button</button>
    )
}

// 선언한 MyButton 컴포넌트를 다른 컴포넌트 안에 중첩할 수 있다.
export default function MyApp(){
    return(
        <div>
            <h1>Welcome to my app</h1>
            <MyButton />
        </div>
    )
}
