export function load_cover() {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = "../assets/bok web cover.png";
    img.classList.add("center-fit");
    img.alt = "bokchoininja title";
    img.style.width = "100%";

    img.onload = () => {
      document.getElementById("cover_image").appendChild(img);
      resolve();
    };
    
    img.onerror = (err) => reject(err);
  });
}