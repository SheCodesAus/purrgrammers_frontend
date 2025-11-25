import './About.css';

function About() {
    return (
        <div className='about-container'>
            <div className='about-section'>
                <h1 className='about-title'>About Save Point</h1>
                <p className='about-description'>
                    Save Point is a collaborative retrospective tool designed to help teams 
                    reflect, learn, and improve together.
                </p>
                <div className='about-content'>
                    <section>
                        <h2>Our Mission</h2>
                        <p>
                            We believe in empowering teams to continuously improve through 
                            structured reflection and open communication.
                        </p>
                    </section>
                    <section>
                        <h2>What We Offer</h2>
                        <p>
                            A simple, intuitive platform for running effective retrospectives 
                            that help your team grow stronger with each iteration.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default About;