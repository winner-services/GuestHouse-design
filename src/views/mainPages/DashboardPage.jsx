function DashboardPage() {
    return <>
        
        <div className="dashboard-body">

            <div className="row gy-4">
                <div className="col-lg-9">
                    {/* Widgets Start */}
                    <div className="row gy-4">
                        <div className="col-xxl-3 col-sm-6">
                            <div className="card">
                                <div className="card-body">
                                    <h4 className="mb-2">155+</h4>
                                    <span className="text-gray-600">Completed Courses</span>
                                    <div className="flex-between gap-8 mt-16">
                                        <span
                                            className="flex-shrink-0 w-48 h-48 flex-center rounded-circle bg-main-600 text-white text-2xl"><i
                                                className="ph-fill ph-book-open"></i></span>
                                        <div id="complete-course" className="remove-tooltip-title rounded-tooltip-value">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xxl-3 col-sm-6">
                            <div className="card">
                                <div className="card-body">
                                    <h4 className="mb-2">39+</h4>
                                    <span className="text-gray-600">Earned Certificate</span>
                                    <div className="flex-between gap-8 mt-16">
                                        <span
                                            className="flex-shrink-0 w-48 h-48 flex-center rounded-circle bg-main-two-600 text-white text-2xl"><i
                                                className="ph-fill ph-certificate"></i></span>
                                        <div id="earned-certificate" className="remove-tooltip-title rounded-tooltip-value">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xxl-3 col-sm-6">
                            <div className="card">
                                <div className="card-body">
                                    <h4 className="mb-2">25+</h4>
                                    <span className="text-gray-600">Course in Progress</span>
                                    <div className="flex-between gap-8 mt-16">
                                        <span
                                            className="flex-shrink-0 w-48 h-48 flex-center rounded-circle bg-purple-600 text-white text-2xl">
                                            <i className="ph-fill ph-graduation-cap"></i></span>
                                        <div id="course-progress" className="remove-tooltip-title rounded-tooltip-value">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xxl-3 col-sm-6">
                            <div className="card">
                                <div className="card-body">
                                    <h4 className="mb-2">18k+</h4>
                                    <span className="text-gray-600">Community Support</span>
                                    <div className="flex-between gap-8 mt-16">
                                        <span
                                            className="flex-shrink-0 w-48 h-48 flex-center rounded-circle bg-warning-600 text-white text-2xl"><i
                                                className="ph-fill ph-users-three"></i></span>
                                        <div id="community-support" className="remove-tooltip-title rounded-tooltip-value">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Widgets End */}

                    {/* Top Course Start */}
                    <div className="card mt-24">
                        <div className="card-body">
                            <div className="mb-20 flex-between flex-wrap gap-8">
                                <h4 className="mb-0">Study Statistics</h4>
                                <div className="flex-align gap-16 flex-wrap">
                                    <div className="flex-align flex-wrap gap-16">
                                        <div className="flex-align flex-wrap gap-8">
                                            <span className="w-8 h-8 rounded-circle bg-main-600"></span>
                                            <span className="text-13 text-gray-600">Study</span>
                                        </div>
                                        <div className="flex-align flex-wrap gap-8">
                                            <span className="w-8 h-8 rounded-circle bg-main-two-600"></span>
                                            <span className="text-13 text-gray-600">Test</span>
                                        </div>
                                    </div>
                                    <select className="form-select form-control text-13 px-8 pe-24 py-8 rounded-8 w-auto">
                                        <option value="1">Yearly</option>
                                        <option value="1">Monthly</option>
                                        <option value="1">Weekly</option>
                                        <option value="1">Today</option>
                                    </select>
                                </div>
                            </div>

                            <div id="doubleLineChart" className="tooltip-style y-value-left"></div>

                        </div>
                    </div>
                    {/* Top Course End */}

                    {/* Top Course Start */}
                    <div className="card mt-24">
                        <div className="card-body">
                            <div className="mb-20 flex-between flex-wrap gap-8">
                                <h4 className="mb-0">Top Courses Pick for You</h4>
                                <a href="student-courses.html"
                                    className="text-13 fw-medium text-main-600 hover-text-decoration-underline">See All</a>
                            </div>

                            <div className="row g-20">
                                <div className="col-lg-4 col-sm-6">
                                    <div className="card border border-gray-100">
                                        <div className="card-body p-8">
                                            <a href="course-details.html"
                                                className="bg-main-100 rounded-8 overflow-hidden text-center mb-8 h-164 flex-center p-8">
                                                <img src="assets/images/thumbs/course-img1.png" alt="Course Image" />
                                            </a>
                                            <div className="p-8">
                                                <span
                                                    className="text-13 py-2 px-10 rounded-pill bg-success-50 text-success-600 mb-16">Development</span>
                                                <h5 className="mb-0"><a href="course-details.html"
                                                    className="hover-text-main-600">Full Stack Web Development</a></h5>

                                                <div className="flex-align gap-8 flex-wrap mt-16">
                                                    <img src="assets/images/thumbs/user-img1.png"
                                                        className="w-28 h-28 rounded-circle object-fit-cover"
                                                        alt="User Image" />
                                                    <div>
                                                        <span className="text-gray-600 text-13">Created by <a
                                                            href="profile.html"
                                                            className="fw-semibold text-gray-700 hover-text-main-600 hover-text-decoration-underline">Albert
                                                            James</a> </span>
                                                    </div>
                                                </div>

                                                <div className="flex-align gap-8 mt-12 pt-12 border-top border-gray-100">
                                                    <div className="flex-align gap-4">
                                                        <span className="text-sm text-main-600 d-flex"><i
                                                            className="ph ph-video-camera"></i></span>
                                                        <span className="text-13 text-gray-600">24 Lesson</span>
                                                    </div>
                                                    <div className="flex-align gap-4">
                                                        <span className="text-sm text-main-600 d-flex"><i
                                                            className="ph ph-clock"></i></span>
                                                        <span className="text-13 text-gray-600">40 Hours</span>
                                                    </div>
                                                </div>

                                                <div className="flex-between gap-4 flex-wrap mt-24">
                                                    <div className="flex-align gap-4">
                                                        <span className="text-15 fw-bold text-warning-600 d-flex"><i
                                                            className="ph-fill ph-star"></i></span>
                                                        <span className="text-13 fw-bold text-gray-600">4.9</span>
                                                        <span className="text-13 fw-bold text-gray-600">(12k)</span>
                                                    </div>
                                                    <a href="course-details.html"
                                                        className="btn btn-outline-main rounded-pill py-9">View Details</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-sm-6">
                                    <div className="card border border-gray-100">
                                        <div className="card-body p-8">
                                            <a href="course-details.html"
                                                className="bg-main-100 rounded-8 overflow-hidden text-center mb-8 h-164 flex-center p-8">
                                                <img src="assets/images/thumbs/course-img5.png" alt="Course Image" />
                                            </a>
                                            <div className="p-8">
                                                <span
                                                    className="text-13 py-2 px-10 rounded-pill bg-warning-50 text-warning-600 mb-16">Design</span>
                                                <h5 className="mb-0"><a href="course-details.html"
                                                    className="hover-text-main-600">Design System</a></h5>

                                                <div className="flex-align gap-8 flex-wrap mt-16">
                                                    <img src="assets/images/thumbs/user-img5.png"
                                                        className="w-28 h-28 rounded-circle object-fit-cover"
                                                        alt="User Image" />
                                                    <div>
                                                        <span className="text-gray-600 text-13">Created by <a
                                                            href="profile.html"
                                                            className="fw-semibold text-gray-700 hover-text-main-600 hover-text-decoration-underline">Albert
                                                            James</a> </span>
                                                    </div>
                                                </div>

                                                <div className="flex-align gap-8 mt-12 pt-12 border-top border-gray-100">
                                                    <div className="flex-align gap-4">
                                                        <span className="text-sm text-main-600 d-flex"><i
                                                            className="ph ph-video-camera"></i></span>
                                                        <span className="text-13 text-gray-600">24 Lesson</span>
                                                    </div>
                                                    <div className="flex-align gap-4">
                                                        <span className="text-sm text-main-600 d-flex"><i
                                                            className="ph ph-clock"></i></span>
                                                        <span className="text-13 text-gray-600">40 Hours</span>
                                                    </div>
                                                </div>

                                                <div className="flex-between gap-4 flex-wrap mt-24">
                                                    <div className="flex-align gap-4">
                                                        <span className="text-15 fw-bold text-warning-600 d-flex"><i
                                                            className="ph-fill ph-star"></i></span>
                                                        <span className="text-13 fw-bold text-gray-600">4.9</span>
                                                        <span className="text-13 fw-bold text-gray-600">(12k)</span>
                                                    </div>
                                                    <a href="course-details.html"
                                                        className="btn btn-outline-main rounded-pill py-9">View Details</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-sm-6">
                                    <div className="card border border-gray-100">
                                        <div className="card-body p-8">
                                            <a href="course-details.html"
                                                className="bg-main-100 rounded-8 overflow-hidden text-center mb-8 h-164 flex-center p-8">
                                                <img src="assets/images/thumbs/course-img6.png" alt="Course Image" />
                                            </a>
                                            <div className="p-8">
                                                <span
                                                    className="text-13 py-2 px-10 rounded-pill bg-danger-50 text-danger-600 mb-16">Frontend</span>
                                                <h5 className="mb-0"><a href="course-details.html"
                                                    className="hover-text-main-600">React Native Courese</a></h5>

                                                <div className="flex-align gap-8 flex-wrap mt-16">
                                                    <img src="assets/images/thumbs/user-img6.png"
                                                        className="w-28 h-28 rounded-circle object-fit-cover"
                                                        alt="User Image" />
                                                    <div>
                                                        <span className="text-gray-600 text-13">Created by <a
                                                            href="profile.html"
                                                            className="fw-semibold text-gray-700 hover-text-main-600 hover-text-decoration-underline">Albert
                                                            James</a> </span>
                                                    </div>
                                                </div>

                                                <div className="flex-align gap-8 mt-12 pt-12 border-top border-gray-100">
                                                    <div className="flex-align gap-4">
                                                        <span className="text-sm text-main-600 d-flex"><i
                                                            className="ph ph-video-camera"></i></span>
                                                        <span className="text-13 text-gray-600">24 Lesson</span>
                                                    </div>
                                                    <div className="flex-align gap-4">
                                                        <span className="text-sm text-main-600 d-flex"><i
                                                            className="ph ph-clock"></i></span>
                                                        <span className="text-13 text-gray-600">40 Hours</span>
                                                    </div>
                                                </div>

                                                <div className="flex-between gap-4 flex-wrap mt-24">
                                                    <div className="flex-align gap-4">
                                                        <span className="text-15 fw-bold text-warning-600 d-flex"><i
                                                            className="ph-fill ph-star"></i></span>
                                                        <span className="text-13 fw-bold text-gray-600">4.9</span>
                                                        <span className="text-13 fw-bold text-gray-600">(12k)</span>
                                                    </div>
                                                    <a href="course-details.html"
                                                        className="btn btn-outline-main rounded-pill py-9">View Details</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Top Course End */}
                </div>

                <div className="col-lg-3">
                    {/* Calendar Start */}
                    <div className="card">
                        <div className="card-body">
                            <div className="calendar">
                                <div className="calendar__header">
                                    <button type="button" className="calendar__arrow left"><i
                                        className="ph ph-caret-left"></i></button>
                                    <p className="display h6 mb-0">""</p>
                                    <button type="button" className="calendar__arrow right"><i
                                        className="ph ph-caret-right"></i></button>
                                </div>

                                <div className="calendar__week week">
                                    <div className="calendar__week-text">Su</div>
                                    <div className="calendar__week-text">Mo</div>
                                    <div className="calendar__week-text">Tu</div>
                                    <div className="calendar__week-text">We</div>
                                    <div className="calendar__week-text">Th</div>
                                    <div className="calendar__week-text">Fr</div>
                                    <div className="calendar__week-text">Sa</div>
                                </div>
                                <div className="days"></div>
                            </div>
                        </div>
                    </div>
                    {/* Calendar End */}

                    <a href="assignment.html" className="text-gray-900 hover-text-main-600"><i
                        className="ph ph-caret-right"></i></a>
                </div>
            </div>
        </div>
        {/* Assignment End */}

        {/* Progress Bar Start */}
        <div className="card mt-24">
            <div className="card-header border-bottom border-gray-100">
                <h5 className="mb-0">My Progress</h5>
            </div>
            <div className="card-body">
                <div id="radialMultipleBar"></div>

                <div className="">
                    <h6 className="text-lg mb-16 text-center"> <span className="text-gray-400">Total hour:</span> 6h
                        32 min</h6>
                    <div className="flex-between gap-8 flex-wrap">
                        <div className="flex-align flex-column">
                            <h6 className="mb-6">60/60</h6>
                            <span className="w-30 h-3 rounded-pill bg-main-600"></span>
                            <span className="text-13 mt-6 text-gray-600">Completed</span>
                        </div>
                        <div className="flex-align flex-column">
                            <h6 className="mb-6">60/60</h6>
                            <span className="w-30 h-3 rounded-pill bg-main-two-600"></span>
                            <span className="text-13 mt-6 text-gray-600">Completed</span>
                        </div>
                        <div className="flex-align flex-column">
                            <h6 className="mb-6">60/60</h6>
                            <span className="w-30 h-3 rounded-pill bg-gray-500"></span>
                            <span className="text-13 mt-6 text-gray-600">Completed</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
}

export default DashboardPage