// DepartmentProjectManagementPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "./DepartmentProjectManagementPage.css";
import axios from 'axios';
import { useUserContext } from "../context/LoginContext";
import ProjectModal from '../Components/ProjectModal';
import DepartmentModal from '../Components/DepartmentModal';
import DepartmentProjectsGrid from '../Components/DepartmentProjectsGrid';

const DepartmentProjectManagementPage = () => {
  const { role, stateBusinessId } = useUserContext();
  const { businessId, businessName } = useParams(); 

  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [error, setError] = useState(null);

  // Modal-related state
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // Inputs for Project Modal
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectImage, setNewProjectImage] = useState('');
  const [newProjectAverageResponseTime, setNewProjectAverageResponseTime] = useState('');

  // Inputs for Department Modal
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [newDepartmentDescription, setNewDepartmentDescription] = useState('');

  const [isBusinessOwner, setIsBusinessOwner] = useState('');

  useEffect(() => {
    fetchDepartments();
    fetchProjects();
    isBusinessOwnerFunction();
  }, [businessId]);

  useEffect(() => {
    isBusinessOwnerFunction();
  }, []);

  const isBusinessOwnerFunction = () => {
    try {
      if (businessId == stateBusinessId) {
        setIsBusinessOwner("yes");
      } else {
        setIsBusinessOwner("no");
      }
    } catch (error) {
      console.error('Error checking business owner status:', error);
      setIsBusinessOwner("no");
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/departments');
      const departmentsData = response.data.map(department => ({
        id: department.departmentId,
        departmentName: department.departmentName,
        description: department.description,
        businessId: department.businessId
      }));

      const businessIdNumber = Number(businessId);
      if (isNaN(businessIdNumber)) {
        setError('Invalid business ID provided.');
        return;
      }

      const filteredDepartments = departmentsData.filter(department => department.businessId === businessIdNumber);
      console.log('Filtered Departments:', filteredDepartments);
      setDepartments(filteredDepartments);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError('Failed to fetch departments. Please try again later.');
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/projects');
      const projectsData = response.data.map(project => ({
        projectId: project.projectId,
        departmentId: project.departmentId,
        name: project.name,
        description: project.description,
        image: project.image,
        averageResponseTime: project.averageResponseTime,
      }));
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to fetch projects. Please try again later.');
    }
  };

  const addProject = async (departmentId) => {
    try {
      await axios.post('http://localhost:8080/api/projects', {
        name: newProjectName,
        description: newProjectDescription,
        image: newProjectImage,
        averageResponseTime: newProjectAverageResponseTime,
        departmentId: departmentId
      });
      await fetchProjects();
      setModalVisible(false);
    } catch (error) {
      console.error('Error adding project:', error);
      handleError(error, 'Failed to add project. Please try again.');
    }
  };

  const addDepartment = async () => {
    try {
      await axios.post('http://localhost:8080/api/departments', {
        departmentName: newDepartmentName,
        description: newDepartmentDescription,
        businessId: businessId, 
      });
      await fetchDepartments();
      setModalVisible(false);
    } catch (error) {
      console.error('Error adding department:', error);
      setError('Failed to add department. Please try again.');
    }
  };

  const updateProject = async (projectId) => {
    try {
      await axios.put(`http://localhost:8080/api/projects/${projectId}`, {
        name: newProjectName,
        description: newProjectDescription,
        image: newProjectImage,
        averageResponseTime: newProjectAverageResponseTime,
        departmentId: selectedDepartmentId 
      });
      await fetchProjects();
      setModalVisible(false);
    } catch (error) {
      console.error('Error updating project:', error);
      setError('Failed to update project. Please try again.');
    }
  };

  const updateDepartment = async (departmentId) => {
    try {
      await axios.put(`http://localhost:8080/api/departments/${departmentId}`, {
        departmentName: newDepartmentName,
        description: newDepartmentDescription,
        businessId: businessId
      });
      await fetchDepartments();
      setModalVisible(false);
    } catch (error) {
      console.error('Error updating department:', error);
      setError('Failed to update department. Please try again.');
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await axios.delete(`http://localhost:8080/api/projects/${projectId}`);
      await fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Failed to delete project. Please try again.');
    }
  };

  const deleteDepartment = async (departmentId) => {
    try {
      await axios.delete(`http://localhost:8080/api/departments/${departmentId}`);
      await fetchDepartments();
      await fetchProjects();
    } catch (error) {
      console.error('Error deleting department:', error);
      setError('Failed to delete department. Please try again.');
    }
  };

  const handleError = (error, defaultMessage) => {
    if (error.response) {
      setError(`Failed: ${error.response.data.message || error.response.statusText}`);
    } else {
      setError(defaultMessage);
    }
  };

  // Handlers for opening modals
  const openUpdateProjectModal = (departmentId, projectId) => {
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

  const openUpdateDepartmentModal = (departmentId) => {
    const department = departments.find(d => d.id === departmentId);
    if (department) {
      setSelectedDepartmentId(departmentId);
      setNewDepartmentName(department.departmentName);
      setNewDepartmentDescription(department.description);
      setModalType('updateDepartment');
      setModalVisible(true);
    }
  };

  const openAddProjectModal = (departmentId) => {
    setSelectedDepartmentId(departmentId);
    setNewProjectName('');
    setNewProjectDescription('');
    setNewProjectImage('');
    setNewProjectAverageResponseTime('');
    setModalType('project');
    setModalVisible(true);
  };

  const openAddDepartmentModal = () => {
    setNewDepartmentName('');
    setNewDepartmentDescription('');
    setModalType('department');
    setModalVisible(true);
  };

  return (
    <div>
      {error && <div className="error-message">{error}</div>}

      {Array.isArray(departments) && departments.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px', margin: '50px' }}>
          <h2>No departments have been added to {businessName}</h2>
          {(role === 'ADMIN' || isBusinessOwner === 'yes') && (
            <button onClick={openAddDepartmentModal}>Add Department</button>
          )}
        </div>
      )}

      {Array.isArray(departments) && departments.length > 0 && (
        <DepartmentProjectsGrid
          departments={departments}
          projects={projects}
          role={role}
          isBusinessOwner={isBusinessOwner}
          onOpenUpdateDepartmentModal={openUpdateDepartmentModal}
          onDeleteDepartment={deleteDepartment}
          onOpenUpdateProjectModal={openUpdateProjectModal}
          onDeleteProject={deleteProject}
          onOpenAddProjectModal={openAddProjectModal}
          onOpenAddDepartmentModal={openAddDepartmentModal}
          businessName={businessName}
        />
      )}

      {modalVisible && (
        <>
          {modalType === 'project' && (
            <ProjectModal
              onClose={() => setModalVisible(false)}
              onSubmit={() => addProject(selectedDepartmentId)}
              projectName={newProjectName}
              setProjectName={setNewProjectName}
              projectDescription={newProjectDescription}
              setProjectDescription={setNewProjectDescription}
              projectImage={newProjectImage}
              setProjectImage={setNewProjectImage}
              averageResponseTime={newProjectAverageResponseTime}
              setAverageResponseTime={setNewProjectAverageResponseTime}
              isUpdate={false}
              role={role}
              isBusinessOwner={isBusinessOwner}
            />
          )}
          {modalType === 'department' && (
            <DepartmentModal
              onClose={() => setModalVisible(false)}
              onSubmit={addDepartment}
              departmentName={newDepartmentName}
              setDepartmentName={setNewDepartmentName}
              departmentDescription={newDepartmentDescription}
              setDepartmentDescription={setNewDepartmentDescription}
              isUpdate={false}
            />
          )}
          {modalType === 'updateProject' && (
            <ProjectModal
              onClose={() => setModalVisible(false)}
              onSubmit={() => updateProject(selectedProjectId)}
              projectName={newProjectName}
              setProjectName={setNewProjectName}
              projectDescription={newProjectDescription}
              setProjectDescription={setNewProjectDescription}
              projectImage={newProjectImage}
              setProjectImage={setNewProjectImage}
              averageResponseTime={newProjectAverageResponseTime}
              setAverageResponseTime={setNewProjectAverageResponseTime}
              isUpdate={true}
              role={role}
              isBusinessOwner={isBusinessOwner}
            />
          )}
          {modalType === 'updateDepartment' && (
            <DepartmentModal
              onClose={() => setModalVisible(false)}
              onSubmit={() => updateDepartment(selectedDepartmentId)}
              departmentName={newDepartmentName}
              setDepartmentName={setNewDepartmentName}
              departmentDescription={newDepartmentDescription}
              setDepartmentDescription={setNewDepartmentDescription}
              isUpdate={true}
            />
          )}
        </>
      )}
    </div>
  );
};

export default DepartmentProjectManagementPage;
