import React, {useState} from "react";
import { Meteor } from "meteor/meteor";

export const AddPatientForm = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [number, setNumber] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || name.length == 0) return;

        await Meteor.callAsync("patients.insert", {
            name: name.trim(),
            email: email.length > 0 ? email.trim() : null,
            number: number.length > 0 ? number.trim() : null,
        });

        setName("");
        setEmail("");
        setNumber("");
    };

    return (
        <form className="patient-form" onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Name (required)"
                value={name}
                onChange={(e) => setName(e.target.value)} // update state on input
            />
            <input
                type="text"
                placeholder="Email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)} // update state on input
            />
            <input
                type="text"
                placeholder="Number (optional)"
                value={number}
                onChange={(e) => setNumber(e.target.value)} // update state on input
            />

            <button type="submit">Add</button>
        </form>
    );
}