function About() {
    return(
        <div className="absolute top-1/2 left-1/2 transform -translate-1/2 
                      text-white text-xl md:text-2xl lg:text-3xl
                      border-2 rounded-2xl
                      w-4/5 md:w-1/2 lg:w-2/5 p-4 md:p-8 lg:p-12">
            <p>
                This project was built for only self improvement. It is non-profit.
            </p>
            <br />
            <p>
                Website uses Firebase for the back-end, and I used React and TailwindCSS for the front-end.
            </p>
            <br />
            <p>Data from <a href="https://www.omdbapi.com/" className="hover:border-b-2 font-semibold">OMDb</a></p>
            <br />
            <p>
                LinkedIn: <a href="https://www.linkedin.com/in/enes-güneş-88a571286" className="hover:border-b-2 font-semibold">Enes Güneş</a>
            </p>
            <br />
            <p>GitHub: <a href="https://github.com/benenesgunes" className="hover:border-b-2 font-semibold">benenesgunes</a></p>
        </div>
    )
}

export default About