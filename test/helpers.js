const chai = require("chai");
global.expect = chai.expect;
const jsdom = require("mocha-jsdom");

jsdom({});
document.addEventListener("DOMContentLoaded", function() {
    const toyCollection = document.querySelector("#toy-collection");
    const toyForm = document.querySelector(".add-toy-form");

    // Fetch Andy's Toys and render them on page load
    fetchToys();

    // Event listener for the "Create Toy" form submission
    toyForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const name = event.target.name.value;
        const image = event.target.image.value;

        // Send POST request to add new toy
        fetch("http://localhost:3000/toys", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: JSON.stringify({
                name: name,
                image: image,
                likes: 0
            })
        })
        .then(response => response.json())
        .then(newToy => {
            renderToy(newToy);
            event.target.reset();
        })
        .catch(error => console.error("Error adding new toy:", error));
    });

    // Function to fetch toys from the API
    function fetchToys() {
        fetch("http://localhost:3000/toys")
            .then(response => response.json())
            .then(toys => {
                toys.forEach(toy => renderToy(toy));
            })
            .catch(error => console.error("Error fetching toys:", error));
    }

    // Function to render a single toy card
    function renderToy(toy) {
        const card = document.createElement("div");
        card.className = "card";

        const h2 = document.createElement("h2");
        h2.textContent = toy.name;

        const img = document.createElement("img");
        img.src = toy.image;
        img.className = "toy-avatar";

        const p = document.createElement("p");
        p.textContent = `${toy.likes} Likes`;

        const button = document.createElement("button");
        button.className = "like-btn";
        button.textContent = "Like ❤️";
        button.id = toy.id;
        button.addEventListener("click", handleLike);

        card.appendChild(h2);
        card.appendChild(img);
        card.appendChild(p);
        card.appendChild(button);

        toyCollection.appendChild(card);
    }

    // Event handler for the "Like" button click
    function handleLike(event) {
        const toyId = event.target.id;
        const likesElement = event.target.previousElementSibling;
        const currentLikes = parseInt(likesElement.textContent);
        const newLikes = currentLikes + 1;

        // Send PATCH request to update likes
        fetch(`http://localhost:3000/toys/${toyId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: JSON.stringify({
                likes: newLikes
            })
        })
        .then(response => response.json())
        .then(updatedToy => {
            likesElement.textContent = `${updatedToy.likes} Likes`;
        })
        .catch(error => console.error(`Error updating likes for toy ${toyId}:`, error));
    }
});
