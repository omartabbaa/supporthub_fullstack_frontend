import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import "./DepartmentProjectManagementPage.css";
import Update from '../assets/Button/sign-up-icon.png';
import axios from 'axios';
import { useUserContext } from "../context/LoginContext";

const DepartmentProjectManagementPage = () => {
  
  const { login, loading, role, stateBusinessId } = useUserContext();
  const { businessId, businessName } = useParams(); 

  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [error, setError] = useState(null);

  // Additional state variables for modal inputs
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectImage, setNewProjectImage] = useState('');
  const [newProjectAverageResponseTime, setNewProjectAverageResponseTime] = useState('');
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [newDepartmentDescription, setNewDepartmentDescription] = useState('');
  const [isBussinessOwner, setIsBussinessOwner] = useState('')
  
  useEffect(() => {
    fetchDepartments();
    fetchProjects();
    console.log('Fetched departments for businessId:', businessId, 'Role:', role);
    isBussinessOwnerFunction()
  }, [businessId]); // Re-run effect when businessId changes

  useEffect(() => {
    isBussinessOwnerFunction()
  },[])

  const isBussinessOwnerFunction = () => {
    console.log('Checking if user is business owner...');
    try {
        if (businessId == stateBusinessId) {
            setIsBussinessOwner("yes");
        } else {
            setIsBussinessOwner("no");
        }
    } catch (error) {
        console.error('Error checking business owner status:', error);
        setIsBussinessOwner("no"); // Default to no if there's an error
    }
}

  // Fetch departments filtered by businessId
  const fetchDepartments = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/departments');
    
      
      // Map departments and include businessId
      const departments = response.data.map(department => ({
        id: department.departmentId,
        departmentName: department.departmentName,
        description: department.description,
        businessId: department.businessId
      }));

    

      // Convert businessId from useParams to Number
      const businessIdNumber = Number(businessId);
 

      if (isNaN(businessIdNumber)) {

        setError('Invalid business ID provided.');
        return;
      }

      // Filter departments by businessId
      const filteredDepartments = departments.filter(department => department.businessId === businessIdNumber);
      setDepartments(filteredDepartments);
 
      
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError('Failed to fetch departments. Please try again later.');
    }
  };

  // Fetch all projects (no filtering needed here)
  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/projects');
      console.log('Projects data fetched:', response.data);
      const projects = response.data.map(project => ({
        projectId: project.projectId,
        departmentId: project.departmentId,
        name: project.name,
        description: project.description,
        image: project.image,
        averageResponseTime: project.averageResponseTime,
      }));
      setProjects(projects);
    } catch (error) {
     
      setError('Failed to fetch projects. Please try again later.');
    }
  };

  // Add Project Function
  const addProject = async (departmentId) => {
    try {
      console.log("Adding project:", newProjectName, newProjectDescription, newProjectImage, newProjectAverageResponseTime, departmentId);
      
      const projectData = {
        name: newProjectName,
        description: newProjectDescription,
        image: newProjectImage,
        averageResponseTime: newProjectAverageResponseTime,
        departmentId: departmentId
      };
   
  
      const response = await axios.post('http://localhost:8080/api/projects', projectData);
    
      fetchProjects();
      setModalVisible(false);
    } catch (error) {
      console.error('Error adding project:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        setError(`Failed to add project: ${error.response.data.message || error.response.statusText}`);
      } else {
        setError('Failed to add project. Please try again.');
      }
    }
  };

  // Add Department Function
  const addDepartment = async () => {
    try {
      console.log("Adding department:", newDepartmentName, newDepartmentDescription);
      const response = await axios.post('http://localhost:8080/api/departments', {
        departmentName: newDepartmentName,
        description: newDepartmentDescription,
        businessId: businessId, // Associate with businessId
      });
   
      fetchDepartments();
      setModalVisible(false);
    } catch (error) {
      console.error('Error adding department:', error);
      setError('Failed to add department. Please try again.');
    }
  };

  // Update Project Function
  const updateProject = async (projectId) => {
    try {
      console.log("Updating project:", projectId, newProjectName, newProjectDescription, newProjectImage, newProjectAverageResponseTime, selectedDepartmentId);
      const response = await axios.put(`http://localhost:8080/api/projects/${projectId}`, {
        name: newProjectName,
        description: newProjectDescription,
        image: newProjectImage,
        averageResponseTime: newProjectAverageResponseTime,
        departmentId: selectedDepartmentId 
      });
   
      fetchProjects();
      setModalVisible(false);
    } catch (error) {
      console.error('Error updating project:', error);
      setError('Failed to update project. Please try again.');
    }
  };

  // Update Department Function
  const updateDepartment = async (departmentId) => {
    try {
      console.log("Updating department:", departmentId, newDepartmentName, newDepartmentDescription);
      const response = await axios.put(`http://localhost:8080/api/departments/${departmentId}`, {
        departmentName: newDepartmentName,
        description: newDepartmentDescription,
        businessId: businessId, // Ensure businessId remains associated
      });
      console.log('Department updated:', response.data);
      fetchDepartments();
      setModalVisible(false);
    } catch (error) {
      console.error('Error updating department:', error);
      setError('Failed to update department. Please try again.');
    }
  };

  // Open Update Project Modal
  const openUpdateProjectModal = (departmentId, projectId, projectName) => {
    const project = projects.find(p => p.projectId === projectId);
    if (project) {
      setSelectedDepartmentId(departmentId);
      setSelectedProjectId(projectId);
      setNewProjectName(project.name);
      setNewProjectDescription(project.description);
      setNewProjectImage(project.image);
      setNewProjectAverageResponseTime(project.averageResponseTime);
      setModalType('updateProject');
      setModalVisible(true);
    }
  };

  // Open Update Department Modal
  const openUpdateDepartmentModal = (departmentId, departmentName) => {
    const department = departments.find(d => d.id === departmentId);
    if (department) {
      setSelectedDepartmentId(departmentId);
      setNewDepartmentName(department.departmentName);
      setNewDepartmentDescription(department.description);
      setModalType('updateDepartment');
      setModalVisible(true);
    }
  };

  // Delete Project Function
  const deleteProject = async (projectId) => {
    try {
      await axios.delete(`http://localhost:8080/api/projects/${projectId}`);
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Failed to delete project. Please try again.');
    }
  };

  // Delete Department Function
  const deleteDepartment = async (departmentId) => {
    try {
      await axios.delete(`http://localhost:8080/api/departments/${departmentId}`);
      fetchDepartments();
      fetchProjects();
    } catch (error) {
      console.error('Error deleting department:', error);
      setError('Failed to delete department. Please try again.');
    }
  };

  return (


    <div>
      {error && <div className="error-message">{error}</div>}
      <div className="DepartmentProjectManagementPageHeader">
  <h1 className="DepartmentProjectManagementPageTitle">{businessName}</h1>
</div>

      {departments.map((department, index) => (
        <div key={`dept-${department.id || index}`}>
          <div className='DepartmentHeader'>

            {role === "ROLE_ADMIN" && isBussinessOwner === "yes" && <div className='DepartmentButtons'>
              <button className='UpdateDepartmentButton' onClick={() => openUpdateDepartmentModal(department.id, department.departmentName)}>
                <img className='UpdateImage' src={Update} alt="Update" />Update Department
              </button>
              <button className='DeleteDepartmentButton' onClick={() => deleteDepartment(department.id)}>X</button>
            </div>}

            <h2 className='DepartmentTitle'>{department.departmentName}</h2>
          </div>
          <div className='ProjectContainer'>
            {projects.filter(project => project.departmentId === department.id).map((project) => (
              <div className='ProjectCardContainer' key={`proj-${project.projectId}`}>
                <div className='ProjectCard'>

                  {role === "ROLE_ADMIN" && isBussinessOwner === "yes" && <div className='ButtonsContainer'>
                    <button className='UpdateProjectButton' onClick={() => openUpdateProjectModal(department.id, project.projectId, project.name)}>
                      <img className='UpdateImage' src={Update} alt="Update" />
                    </button>
                    <button className='DeleteProjectButton' onClick={() => deleteProject(project.projectId)}>X</button>
                  </div>}

                  <Link to={`/question-overview/${encodeURIComponent(department.departmentName)}/${encodeURIComponent(project.name)}/${project.projectId}`}>
                    <div className='image-Component'>
                      <img className='ProjectImage' src={project.image} alt={project.name} />
                    </div>
                    <div className='TitleProject'>{project.name}</div>
                  </Link>
                </div>
              </div>
            ))}
            {role === "ROLE_ADMIN" && isBussinessOwner === "yes" && (
              <div className='ProjectContainerBox'>
                <button className='AddProjectButton' onClick={() => {
                  setSelectedDepartmentId(department.id);
                  console.log("Setting department ID for project:", department.id);
                  setModalType('project');
                  setModalVisible(true);
                }}>
                  <div className='AddProject'>+</div>
                </button>
                <div className='projectDescription'>
                  By adding a project you can manage your questions
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
 
      {role === "ROLE_ADMIN" && isBussinessOwner === "yes" && (
        <>
       
          <button 
            className='AddDepartmentButton' 
            onClick={() => {
              setModalType('department');
              setModalVisible(true);
            }}
          >
            +
          </button>

          <div className='DepartmentDescription'>
            By adding a Question category also referred to as department you can manage your projects
          </div>
        </>
      )}

      {modalVisible && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setModalVisible(false)}>x</span>
            {modalType === 'project' && (
              <div>
                
                <h2>Add New Project</h2>
                <input
                  type="text"
                  placeholder="Project Name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
                <textarea
                  placeholder="Project Description"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Project Image URL"
                  value={newProjectImage}
                  onChange={(e) => setNewProjectImage(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Average Response Time"
                  value={newProjectAverageResponseTime}
                  onChange={(e) => setNewProjectAverageResponseTime(e.target.value)}
                />
                {role === "ROLE_ADMIN" && isBussinessOwner === "yes" && <button className='AddProjectButtonModal' onClick={() => addProject(selectedDepartmentId)}>Add Project</button>}
               
              </div>
            )}
            {modalType === 'department' && (
              <div>
                <h2>Add New Department</h2>
                <input
                  type="text"
                  placeholder="Department Name"
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                />
                <textarea
                  placeholder="Department Description"
                  value={newDepartmentDescription}
                  onChange={(e) => setNewDepartmentDescription(e.target.value)}
                />
                <button onClick={addDepartment}>Add Department</button>
              </div>
            )}
            {modalType === 'updateProject' && (
              <div>
                <h2>Update Project</h2>
                <input
                  type="text"
                  placeholder="Project Name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
                <textarea
                  placeholder="Project Description"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Project Image URL"
                  value={newProjectImage}
                  onChange={(e) => setNewProjectImage(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Average Response Time"
                  value={newProjectAverageResponseTime}
                  onChange={(e) => setNewProjectAverageResponseTime(e.target.value)}
                />
                {role === "ROLE_ADMIN" && isBussinessOwner === "yes" && <button onClick={() => updateProject(selectedProjectId)}>Update Project</button>}
              </div>
            )}
            {modalType === 'updateDepartment' && (
              <div>
                <h2>Update Department</h2>
                <input
                  type="text"
                  placeholder="Department Name"
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                />
                <textarea
                  placeholder="Department Description"
                  value={newDepartmentDescription}
                  onChange={(e) => setNewDepartmentDescription(e.target.value)}
                />
               
                <button className='UpdateDepartmentButtonModal' onClick={() => updateDepartment(selectedDepartmentId)}>Update Department</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentProjectManagementPage;

