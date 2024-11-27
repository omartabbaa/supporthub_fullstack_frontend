// AdminDashboardPage.js

import './AdminDashboardPage.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUserContext } from "../context/LoginContext";

const AdminDashboardPage = () => {
    const { token, stateBusinessId } = useUserContext();
    const [hoveredExpertId, setHoveredExpertId] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [experts, setExperts] = useState([]);
    const [projects, setProjects] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [toggleStates, setToggleStates] = useState({});
    // Updated state variable for open accordion
    const [openAccordionId, setOpenAccordionId] = useState(null);
    const [isPermissionFormVisible, setIsPermissionFormVisible] = useState(false);
    const [formData, setFormData] = useState({
        selectedDepartment: '',
        selectedProject: '',
        selectedUser: '',
        canAnswer: false
    });
    const [stateAdmin, setStateAdmin] = useState([]);

    // Fetch data on component mount and token change
    useEffect(() => {
        if (token) {
            fetchAndSetData();
        }
    }, [token]);

    // Combined function to fetch initial data
    const fetchAndSetData = () => {
        fetchDepartments();
        fetchExperts();
        fetchProjects();
        fetchPermissions();
        fetchAdminData();
    };

    const fetchAdminData = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/admins', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const filteredAdmin = response.data.filter(admin => admin.businessId === stateBusinessId);

            setStateAdmin(filteredAdmin);

   
        } catch (error) {
            console.error('Error fetching Admin:', error);
            throw error; // Propagate error to be caught in fetchAndSetData
        }
    };

    // Fetch departments
    const fetchDepartments = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/departments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const filteredDepartments = response.data.filter(dept => dept.businessId === stateBusinessId);
            setDepartments(filteredDepartments);
  
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    // Fetch experts
    const fetchExperts = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/users', {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Extract admin userIds
            const adminUserIds = stateAdmin.map(admin => admin.userId);

            // Filter experts whose userId is NOT in adminUserIds
            const filteredExperts = response.data.filter(expert => !adminUserIds.includes(expert.userId));

            setExperts(filteredExperts);

            console.log('Fetched Experts:', response.data);
            console.log('Filtered Experts:', filteredExperts);
        } catch (error) {
            console.error('Error fetching experts:', error);
            throw error; // Propagate error to be caught in fetchAndSetData
        }
    };

    // Fetch projects
    const fetchProjects = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/projects', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProjects(response.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    // Fetch permissions
    const fetchPermissions = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/permissions', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPermissions(response.data);
            initializeToggleStates(response.data);
        } catch (error) {
            console.error('Error fetching permissions:', error);
        }
    };

    // Initialize toggle states
    const initializeToggleStates = (permissionsData) => {
        const newToggleStates = {};
        permissionsData.forEach(permission => {
            const toggleId = createToggleId(permission.departmentId, permission.projectId, permission.userId);
            newToggleStates[toggleId] = permission.canAnswer;
        });
        setToggleStates(newToggleStates);
    };

    // Create toggle ID
    const createToggleId = (departmentId, projectId, userId) =>
        `${departmentId || 'dept'}-${projectId || 'proj'}-${userId}`;

    // Handle permission toggle
    const handleToggle = async (deptIndex, expertIndex, projectId = null) => {
        const department = departments[deptIndex];
        const expert = experts[expertIndex];
        const toggleId = createToggleId(department.departmentId, projectId, expert.userId);

        const newCanAnswer = !toggleStates[toggleId];
        const previousToggleStates = { ...toggleStates };

        // Update toggle state optimistically
        setToggleStates(prevStates => ({
            ...prevStates,
            [toggleId]: newCanAnswer
        }));

        try {
            const existingPermission = permissions.find(permission =>
                permission.userId === expert.userId &&
                permission.departmentId === department.departmentId &&
                permission.projectId === projectId
            );

            if (existingPermission) {
                await axios.patch(`http://localhost:8080/api/permissions/${existingPermission.permissionId}`, {
                    userId: expert.userId,
                    departmentId: department.departmentId,
                    projectId: projectId,
                    canAnswer: newCanAnswer
                });
                console.log(newCanAnswer, 'patch')
            } else {
                const response = await axios.post('http://localhost:8080/api/permissions', {
                    userId: expert.userId,
                    departmentId: department.departmentId,
                    projectId: projectId,
                    canAnswer: newCanAnswer
                });
                setPermissions([...permissions, response.data]);
                console.log('post',newCanAnswer)
            }
        } catch (error) {
            console.error('Error updating permission:', error);
            setToggleStates(previousToggleStates);
        }
    };

    // Expand accordion
    const expandAccordion = (departmentId) => {
        setOpenAccordionId(prevId => (prevId === departmentId ? null : departmentId));
    };

    // Show permission form
    const handleAddPermission = () => setIsPermissionFormVisible(true);

    // Submit new permission
    const submitPermission = async () => {
        const { selectedUser, selectedDepartment, selectedProject, canAnswer } = formData;
        if (selectedUser && selectedDepartment) {
            try {
                await axios.post('http://localhost:8080/api/permissions', {
                    userId: selectedUser,
                    departmentId: selectedDepartment,
                    projectId: selectedProject || null,
                    canAnswer
                });
                fetchPermissions();
                setIsPermissionFormVisible(false);
                resetForm();
            } catch (error) {
                console.error('Error adding permission:', error);
            }
        } else {
            alert("Please select a user and a department.");
        }
    };

    // Reset form data
    const resetForm = () => setFormData({
        selectedDepartment: '',
        selectedProject: '',
        selectedUser: '',
        canAnswer: false
    });

    // Update form data
    const updateFormData = (field, value) =>
        setFormData(prev => ({ ...prev, [field]: value }));

    return (
        <div className="admin-dashboard">
            <h1 className="dashboard-title">Admin Dashboard</h1>
            <h2 className="dashboard-subtitle">
                Grant targeted access to experts and agents for answering tickets related to specific products or entire product categories.
            </h2>

            <div className="department-grid">
                {departments.map((department, deptIndex) => (
                    <div key={department.departmentId} className="department-card">
                        <div className="department-header">
                            <h2 className="department-name">{department.departmentName}</h2>
                            <button
                                onClick={() => expandAccordion(department.departmentId)}
                                className="accordion-experts-button"
                            >
                                {openAccordionId === department.departmentId ? '-' : '+'}
                            </button>
                        </div>
                        
                        {openAccordionId === department.departmentId && (
                            <div className="experts-list">
                                <ul className="experts-container">
                                    {experts.map((expert, expertIndex) => {
                                        const departmentToggleId = createToggleId(department.departmentId, null, expert.userId);

                                        return (
                                            <li
                                                key={expert.userId}
                                                className={`expert-item ${toggleStates[departmentToggleId] ? "expert-item-active" : ""}`}
                                                onMouseEnter={() => setHoveredExpertId(expert.userId)}
                                                onMouseLeave={() => setHoveredExpertId(null)}
                                                id="container"
                                            >
                                                <div className='expert-item-container'>
                                                    <span className="expert-name">{expert.name}</span>
                                         
                                                </div>

                                                {hoveredExpertId === expert.userId && (
                                                    <div className='section_projects_container'>
                                                        {projects.filter(project => project.departmentId === department.departmentId).map(project => {
                                                            const projectToggleId = createToggleId(department.departmentId, project.projectId, expert.userId);
                                                            return (
                                                                <div key={project.projectId} className="project-permission">
                                                                    <span className="project-name">{project.name}</span>
                                                                    <button
                                                                        className={`toggleButton ${toggleStates[projectToggleId] ? "active" : ""}`}
                                                                        onClick={() => handleToggle(deptIndex, expertIndex, project.projectId)}
                                                                    >
                                                                        <div className="toggle-circle"></div>
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>

   
            <button className="add-permission-button" onClick={handleAddPermission}>Add Permission</button>
            {isPermissionFormVisible && (
                <div className="permission-form">
                    <h3>Add New Permission</h3>
                    <select value={formData.selectedUser} onChange={(e) => updateFormData('selectedUser', e.target.value)}>
                        <option value="">Select User</option>
                        {experts.map(expert => (
                            <option key={expert.userId} value={expert.userId}>{expert.name}</option>
                        ))}
                    </select>
                    <select value={formData.selectedDepartment} onChange={(e) => updateFormData('selectedDepartment', e.target.value)}>
                        <option value="">Select Department</option>
                        {departments.map(department => (
                            <option key={department.departmentId} value={department.departmentId}>{department.departmentName}</option>
                        ))}
                    </select>
                    <select value={formData.selectedProject} onChange={(e) => updateFormData('selectedProject', e.target.value)}>
                        <option value="">Select Project (optional)</option>
                        {projects
                            .filter(project => project.departmentId === formData.selectedDepartment)
                            .map(project => (
                                <option key={project.projectId} value={project.projectId}>{project.name}</option>
                            ))
                        }
                    </select>
                    <label>
                        <input
                            type="checkbox"
                            checked={formData.canAnswer}
                            onChange={() => updateFormData('canAnswer', !formData.canAnswer)}
                        />
                        Can Answer
                    </label>
                    <button onClick={submitPermission}>Submit Permission</button>
                    <button onClick={() => setIsPermissionFormVisible(false)}>Cancel</button>
                </div>
            )}
        </div>
    );

};

export default AdminDashboardPage;
