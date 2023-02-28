import React from "react";
import { student_meta } from "../../util/proxy";

export function User(props: {student: student_meta}) {
    return (
        <div className="row user">
            <img className="user-img" src={props.student.profile_img}/>
            <p>{props.student.first} {props.student.last}</p>
        </div>
    )
}