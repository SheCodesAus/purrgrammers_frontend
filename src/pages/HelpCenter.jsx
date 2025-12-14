import { useState } from 'react';
import './HelpCenter.css';

function HelpCenter() {
    const [openFaq, setOpenFaq] = useState(null);
    const [formSubmitted, setFormSubmitted] = useState(false);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const handleSubmit = (e) => {
        // Netlify will handle the form submission automatically
        setFormSubmitted(true);
        setTimeout(() => setFormSubmitted(false), 5000);
    };

    const faqs = [
        {
            category: "Getting Started",
            questions: [
                {
                    q: "How do I create my first retro board?",
                    a: "Go to your Dashboard and click the '+ New Board' button. Give your board a name, select a team (or create one), and you're ready to start your retrospective!"
                },
                {
                    q: "How do I invite team members?",
                    a: "Teams are managed in the sidebar on your Dashboard. Click on a team name to open the detail modal, then use the 'Add Member' button. Enter their username to add them to your team."
                }
            ]
        },
        {
            category: "Boards & Cards",
            questions: [
                {
                    q: "How do I create cards?",
                    a: "Click the '+ Add Card' button in any column on your retro board. Type your thought, optionally add tags, and submit. Your card will appear instantly for all team members."
                },
                {
                    q: "How does voting work?",
                    a: "Click the vote button on any card to cast your vote. The board owner controls when voting is active. You can see vote counts on each card to identify the most important topics."
                },
                {
                    q: "Can I edit or delete cards after creating them?",
                    a: "Yes! Click on any card to open the detail view. From there, you can edit the content, add or remove tags, or delete the card entirely."
                },
                {
                    q: "What are tags and how do I use them?",
                    a: "Tags help categorize cards by themes like 'technical', 'process', or 'teamwork'. Add tags when creating or editing cards to make patterns easier to spot during discussions."
                }
            ]
        },
        {
            category: "Teams & Collaboration",
            questions: [
                {
                    q: "How do I create a team?",
                    a: "On your Dashboard, find the Teams sidebar and click the '+' button. Give your team a name and you can start adding members and creating boards."
                },
                {
                    q: "How do I add members to my team?",
                    a: "Open the team detail modal by clicking on the team name. Use the 'Add Member' button and search for users by username to add them to your team."
                },
                {
                    q: "Can I be part of multiple teams?",
                    a: "Absolutely! You can join as many teams as you need. Each team can have its own boards and members."
                },
                {
                    q: "Who can see my boards?",
                    a: "Only members of the team that owns the board can see and interact with it. Boards are private to team members."
                }
            ]
        },
        {
            category: "Account & Settings",
            questions: [
                {
                    q: "How do I update my profile?",
                    a: "Click on your avatar in the navigation bar to open your profile modal. From there you can update your job role and location."
                },
                {
                    q: "How do I change my password?",
                    a: "Ah, the feature that's currently on the 'someday maybe' list! Emma can only do so much. For now, if you need a password change, reach out through the contact form below."
                },
                {
                    q: "Can I delete my account?",
                    a: "Yes, account deletion can be requested by contacting support. Please note this action is permanent and will remove all your data."
                }
            ]
        },
        {
            category: "Troubleshooting",
            questions: [
                {
                    q: "The board isn't updating in real-time",
                    a: "Try refreshing the page. If the issue persists, check your internet connection. Real-time updates use WebSockets, so make sure your network allows WebSocket connections."
                },
                {
                    q: "I can't see my team's boards",
                    a: "Make sure you're logged in and that you're a member of the team. If you were just added, try refreshing the page. If the issue continues, contact support."
                },
                {
                    q: "Cards aren't saving properly",
                    a: "This usually indicates a connection issue. Check your internet connection and try again. If cards continue to fail to save, refresh the page and try again."
                },
                {
                    q: "I forgot my password",
                    a: "No worries! Use the contact form below to reach out to support, and we'll help you get back into your account."
                }
            ]
        }
    ];

    return (
        <div className='help-center-container'>
            {/* Hero Section */}
            <section className='help-hero-section'>
                <h1 className='help-hero-title'>Help Center</h1>
                <p className='help-hero-subtitle'>Find answers to common questions or reach out to our team</p>
            </section>

            {/* Quick Actions */}
            <section className='quick-actions-section'>
                <div className='quick-actions-grid'>
                    <a href="#contact-form" className='quick-action-card'>
                        <span className='quick-action-icon material-icons'>email</span>
                        <h3 className='quick-action-title'>Contact Support</h3>
                        <p className='quick-action-description'>Get help from our team</p>
                    </a>
                    <a href="#faq" className='quick-action-card'>
                        <span className='quick-action-icon material-icons'>help_outline</span>
                        <h3 className='quick-action-title'>Browse FAQ</h3>
                        <p className='quick-action-description'>Find quick answers</p>
                    </a>
                    <a href="#contact-form" className='quick-action-card'>
                        <span className='quick-action-icon material-icons'>bug_report</span>
                        <h3 className='quick-action-title'>Report a Bug</h3>
                        <p className='quick-action-description'>Let us know what's wrong</p>
                    </a>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className='faq-section'>
                <h2 className='faq-section-title'>Frequently Asked Questions</h2>
                {faqs.map((category, categoryIndex) => (
                    <div key={categoryIndex} className='faq-category'>
                        <h3 className='faq-category-title'>{category.category}</h3>
                        <div className='faq-list'>
                            {category.questions.map((faq, faqIndex) => {
                                const uniqueIndex = `${categoryIndex}-${faqIndex}`;
                                const isOpen = openFaq === uniqueIndex;
                                return (
                                    <div key={uniqueIndex} className='faq-item'>
                                        <button 
                                            className='faq-question'
                                            onClick={() => toggleFaq(uniqueIndex)}
                                        >
                                            <span>{faq.q}</span>
                                            <span className='material-icons faq-icon'>
                                                {isOpen ? 'expand_less' : 'expand_more'}
                                            </span>
                                        </button>
                                        {isOpen && (
                                            <div className='faq-answer'>
                                                {faq.a}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </section>

            {/* Contact Form Section */}
            <section id="contact-form" className='contact-section'>
                <div className='contact-form-wrapper'>
                    <h2 className='contact-title'>Still Need Help?</h2>
                    <p className='contact-subtitle'>Send us a message and we'll get back to you within 24-48 hours</p>
                    
                    {formSubmitted ? (
                        <div className='form-success'>
                            <span className='material-icons success-icon'>check_circle</span>
                            <h3>Message Sent!</h3>
                            <p>We've received your message and will respond soon.</p>
                        </div>
                    ) : (
                        <form 
                            name="contact" 
                            method="POST" 
                            data-netlify="true"
                            onSubmit={handleSubmit}
                            className='contact-form'
                        >
                            <input type="hidden" name="form-name" value="contact" />
                            
                            <div className='form-group'>
                                <label htmlFor='name'>Name</label>
                                <input 
                                    type='text' 
                                    id='name' 
                                    name='name' 
                                    required 
                                    placeholder='Your name'
                                />
                            </div>

                            <div className='form-group'>
                                <label htmlFor='email'>Email</label>
                                <input 
                                    type='email' 
                                    id='email' 
                                    name='email' 
                                    required 
                                    placeholder='your.email@example.com'
                                />
                            </div>

                            <div className='form-group'>
                                <label htmlFor='subject'>Subject</label>
                                <select id='subject' name='subject' required>
                                    <option value=''>Select a topic</option>
                                    <option value='general'>General Question</option>
                                    <option value='bug'>Bug Report</option>
                                    <option value='feature'>Feature Request</option>
                                    <option value='account'>Account Issue</option>
                                    <option value='other'>Other</option>
                                </select>
                            </div>

                            <div className='form-group'>
                                <label htmlFor='message'>Message</label>
                                <textarea 
                                    id='message' 
                                    name='message' 
                                    required 
                                    rows='6'
                                    placeholder='Tell us what you need help with...'
                                ></textarea>
                            </div>

                            <button type='submit' className='btn btn-primary submit-btn'>
                                Send Message
                            </button>
                        </form>
                    )}
                </div>
            </section>

            {/* About Section */}
            <section className='about-section'>
                <div className='about-content'>
                    <h2 className='about-title'>About Save Point</h2>
                    <p className='about-description'>
                        Save Point was created by <strong>Purrgrammers</strong> as our final group project for the She Codes Plus Perth 2025 Cohort.
                    </p>
                    <div className='team-members'>
                        <h3 className='team-title'>The Team</h3>
                        <ul className='team-list'>
                            <li>Emma Spear</li>
                            <li>Jinfeng Shen</li>
                            <li>Juliane Gutierrez</li>
                            <li>Krista Soosaar</li>
                            <li>Tammy Healy</li>
                        </ul>
                    </div>
                    <p className='about-footer'>
                        Made with 💜 by Purrgrammers
                    </p>
                </div>
            </section>
        </div>
    );
}

export default HelpCenter;
