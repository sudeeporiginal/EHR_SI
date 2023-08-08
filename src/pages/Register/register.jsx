import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { TextEncoder } from 'text-encoding';
import { AgentAddressContext } from '../../App';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import Agent from '../../artifacts/contracts/Agent.sol/Agent.json';
import { create } from 'ipfs-http-client';
import 'bootstrap/dist/css/bootstrap.css';




const Register = () => {
    const agentContractAddress = useContext(AgentAddressContext);
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [designation, setDesignation] = useState("0");
    const [showAlert, setShowAlert] = useState(false);
    const [alertinfo, setAlertinfo] = useState(false);


    const history = useNavigate();

    const Buffer = (str) => {
        return new Uint8Array([...str].map((char) => char.charCodeAt(0)));
    };
    const ipfs = create({
        host: 'localhost',
        port: 5001,
        protocol: 'http',
    });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(agentContractAddress, Agent.abi, provider);
    const signer = provider.getSigner();
    const contractWithSigner = contract.connect(signer);

    var ipfshash = '';

    const handleAlert1Click = () => {
        setShowAlert(true); // Show the alert
    };

    const handleAlert1Close = () => {
        setShowAlert(false); // Hide the alert
    };
    const handleAlert2Click = () => {
        setAlertinfo(true); // Show the alert
    };

    const handleAlert2Close = () => {
        setAlertinfo(false); // Hide the alert
    };

    const NavigateP = () => {
        history('/patient');
    };
    const NavigateD = () => {
        history('/doctor');
    }

    const addMem = async () => {
        try {
            // console.log(ipfshash);
            const result = await contractWithSigner.add_agent(name, age, designation, ipfshash);
            console.log(result);
            if (designation === '0') NavigateP();
            if (designation === '1') NavigateD();
        } catch (error) {
            alert("Something went wrong!!!");
            
            console.log("Error: ", error);
            window.location.reload();
        }
    };


    async function addAgent() {
        console.log(name);
        setDesignation(parseInt(designation));
        const signer = provider.getSigner();
        let publicKey = await signer.getAddress();
        publicKey = publicKey.toLowerCase();
        console.log("PK:" + publicKey);

        var validPublicKey = true;
        var validAgent = true;
        var PatientList = 0;
        var DoctorList = 0;
        // var InsurerList = 0;
        try {
            var result = await contract.get_patient_list();
            PatientList = result;
            result = await contract.get_doctor_list();
            DoctorList = result;
            /*    var result = await contract.get_insurer_list();
                var InsurerList = result; */
            if (validPublicKey === false) {
                handleAlert1Click();
            }
            else {
                for (var j = 0; j < PatientList.length; j++) {
                    if (publicKey === PatientList[j]) {
                        validAgent = false;
                    }
                }
                for (j = 0; j < DoctorList.length; j++) {
                    if (publicKey === DoctorList[j]) {
                        validAgent = false;
                    }
                }
                /*   for (j = 0; j < InsurerList.length; j++) {
                       if (publicKey === InsurerList[j]) {
                           validAgent = false;
                       }
                   }*/
                console.log(validAgent);
                if (validAgent === true) {
                    handleAlert1Close();
                    handleAlert2Close();
                    console.log(designation);
                    if (designation === "0") {
                        var reportTitle = `Name: ${name}Public Key: ${publicKey}`;
                        function stringToUint8Array(str) {
                            const encoder = new TextEncoder();
                            return encoder.encode(str);
                        }
                        const buffer = stringToUint8Array(reportTitle);
                        /*  const response = await fetch('http://localhost:5001/api/v0/add?stream-channels=true&progress=false', {
                              method: 'POST',
                              mode: 'non-cors',
                              headers: {
                                  'Access-Control-Allow-Origin': 'http://localhost:3000'
                              },
                              body: buffer // include the request body if required
                          });*/
                        const result = await ipfs.add(buffer); // Upload the buffer to IPFS
                        ipfshash = result.cid.toString();
                        // Get the IPFS has
                        console.log("IPFS hash:", ipfshash);
                        await addMem();
                    }
                    else {
                        await addMem();
                    }
                }
                else {
                    handleAlert2Click();
                }

            }
            return false;
        }
        catch (error) {
            console.log("Error: ", error)
        }
    }
    return (
        <div>
            <nav className="navbar navbar-inverse navbar-static-top" role="navigation">
                <div className="container-fluid">

                    <div className="navbar-header">
                      
                        <Link className="navbar-brand" to={'/'}>Electronic Health Records</Link>
                        <Link className="navbar-brand" to={'/'}>Login</Link>
                        <Link className="navbar-brand" to={'/register'}>Register</Link>
                    </div>

                    <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                        <ul className="nav navbar-nav navbar-right">
                            <li>
                                <Link to="/">Login</Link>
                            </li>
                            <li className="active">
                                <Link to="/register">Register</Link>
                            </li>
                        </ul>
                    </div>

                </div>

            </nav>

            <div className="container">
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <h3 className="text-center">Please enter your details to register.</h3>
                    </div>
                    <div className="panel-body">
                        <div className="row">
                            {showAlert && (
                                <div className="alert alert-warning col-sm-8 col-sm-offset-2">
                                    <strong>Warning!</strong> Invaid public key. Please enter a valid public key to register.
                                </div>
                            )}
                            {alertinfo && (
                                <div className="alert alert-info col-sm-8 col-sm-offset-2">
                                    <strong>Info!</strong> User already registered. Please check your details.
                                </div>
                            )}

                        </div>

                        <form name="registerForm" className="form-horizontal">
                            <div className="form-group">
                                <label className="control-label col-sm-2" for="name">Name:</label>
                                <div className="col-sm-8">
                                    <input type="text" className="form-control" id="name" placeholder="Enter name" name="Name" required autofocus value={name} onChange={(e) => setName(e.target.value)} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="control-label col-sm-2" for="age">Age:</label>
                                <div className="col-sm-8">
                                    <input type="age" className="form-control" id="age" placeholder="Enter age" name="Age" required value={age} onChange={(e) => setAge(e.target.value)} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label for="designation" className="control-label col-sm-2">Registering as:</label>
                                <div className="col-sm-8">
                                    <select className="form-control" id="designation" required value={designation} onChange={(e) => setDesignation(e.target.value)}>
                                        <option value="0">Patient</option>
                                        <option value="1">Doctor</option>
                                    </select>
                                </div>
                            </div>

                        </form>
                        <div className="text-center">
                            <button className="btn btn-primary btn-lg" onClick={addAgent}>Register</button>
                        </div>
                    </div>
                </div>

                <hr />

            </div>

        </div>
    );
};

export default Register;
