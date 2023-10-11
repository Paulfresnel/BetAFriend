import { Button, Input,
     NumberInput,
     InputLeftAddon,
    InputGroup, Card, 
    CardHeader, CardFooter, 
    Heading, CardBody, Badge } from '@chakra-ui/react';
import proposalContractABI from '../../contracts/codexDAOGovernance.json'; // Replace with your ABI file
import { useEffect, useState } from 'react';
import "./CreateProposal.css";
import { Block, ethers } from "ethers";
import {MutatingDots} from "react-loader-spinner";
 


function CreateProposal(props){

    const {userAccount, setUserAccount} = props;
    
    const [proposalsCount, setProposalsCount] = useState(0);
    const [displayWindow, setDisplayWindow] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [proposalTitle, setProposalTitle] = useState('');
    const [proposalInitialAmount, setProposalInitialAmount] = useState(0);
    const [proposalFormError, setProposalFormError] = useState("");
    const [proposalsArray, setProposalsArray] = useState([]);
    const [voteAmount,setVoteAmount] = useState(0);
    const [voteMessage, setVoteMessage] = useState('');
    let codexDAOAddress = "0x5C977C3f87082FF2FF20F7A7cdD5D8Dbdf3cf05a";

    // Connect to Alchemy provider & Extract signer from provider
    const provider = new ethers.JsonRpcProvider(process.env.REACT_APP_ALCHEMY_URL);
    const signer = new ethers.Wallet(process.env.REACT_APP_PRIVATE_KEY, provider);

    const codexDAOGovernanceAddress = new ethers.Contract(
        codexDAOAddress,
        proposalContractABI,
        signer
          );

    let formHandle = (e, setter, value) =>{
        e.preventDefault();
        setter(value)
    }

    let voteOnProposal = async (e,proposalId, votingAmount, voteIntetion) =>{
        e.preventDefault();
        if (votingAmount <=0){
            setVoteMessage('Please input an amount greater than 0');
        } else {
        try{
        const callVote = await codexDAOGovernanceAddress.castVote(proposalId, votingAmount, voteIntetion);
        codexDAOGovernanceAddress.on('newVote', (voter, proposalId, timestamp)=>{
            console.log("New Vote registered by user", voter, "voted on proposal", proposalId);
        })
        setVoteMessage('Congratulations, you have voted on a proposal');
        setTimeout(()=>{
            setVoteMessage("");
        }, 1000);
        console.log('vote date:', callVote);
        fetchProposals();
    } catch (err){
        console.log("err", err);
        setVoteMessage('There was an error, check the console for more information');
        setTimeout(()=>{
            setVoteMessage('');
        }, 1000)
        }
            }
    }


    let createProposal = async (event, title, initialAmount) => {
        console.log(title, initialAmount);
        event.preventDefault();
        try{
        if (initialAmount <= 150 || title === ""  || title === "undefined"){
            setProposalFormError("You need to lock at least 150 Tokens for a proposal creation and give a title to your proposal");
            setTimeout(()=>{
                setProposalFormError('');
            }, 1000)
        }
        else if (title !== "" && initialAmount >= 150){
            console.log("calling smart contract method");
            let totalHolders = await codexDAOGovernanceAddress.addressBalance(userAccount)
            console.log("calling total holders:", totalHolders);
            let newProposal = await codexDAOGovernanceAddress.createProposal(title, initialAmount);
            console.log("proposal created:", newProposal);
            codexDAOGovernanceAddress.on('newProposal', (creator, proposalId, creationDate, event)=>{
                console.log("New Event created confirmed:", creator, proposalId, creationDate);
                setProposalFormError("Your proposal has been created successfully");
                setTimeout(()=>{
                    setProposalFormError("");
                },1500)
            })
    }
    } catch(err){
        console.log("err:", err)
    }

    }

    let fetchProposals = async () => {
        setIsLoading(true);
        const latestProposalId = await codexDAOGovernanceAddress.proposalId();
        console.log("last proposal id:", parseInt(latestProposalId));
        let todaysDate = new Date();
        for (let i=0; i < latestProposalId; i++){
            let proposal = await codexDAOGovernanceAddress.returnProposal(i);
            let date = new Date (parseInt(proposal[5])*1000);
            if (proposalsArray.some(e => e[0] === proposal[0])){
                continue;
            } else if (date >= todaysDate - 604800){
                continue;
            } 
            else{
                setProposalsArray(current=>[...current,proposal]);
            }
        }
        setTimeout(()=>{
            setIsLoading(false)
        }, 1000) ;
    }


    useEffect(()=>{
        let fetchProposalCount = async () =>{
            let proposalsCount = await codexDAOGovernanceAddress.proposalId();
            setProposalsCount(parseInt(proposalsCount));
        };
        fetchProposalCount();
    },[])


    return(
        <div>
            <div>Over {proposalsCount} Proposals have been created so far by our community</div>
            <Button onClick={(e)=>fetchProposals()}>Fetch Proposals</Button>
            <Button onClick={(e)=>setDisplayWindow(!displayWindow)}>{displayWindow === false ? "Create a proposal" : "Hide creation form"}</Button>
            {displayWindow === true ? <form>
            <div className='flex-form'>
            <Input placeholder='Proposal Title' className='shortened' onChange={(e)=>formHandle(e, setProposalTitle, e.target.value)} type="text"></Input>
            <Input type="number" placeholder='Initial Amount of Tokens to lock in proposals' className='shortened' onChange={(e)=>formHandle(e, setProposalInitialAmount, e.target.value)}></Input>
            </div>
            <InputGroup className='flexing'>
            <InputLeftAddon children="creator"></InputLeftAddon>
            <Input className='shortened' disabled value={userAccount}>
            </Input>
            </InputGroup>
            <Button className='margin-top' onClick={(e)=>createProposal(e, proposalTitle, proposalInitialAmount)}>Create New Proposal</Button>
            </form>
            : <p>Proposals Listing</p>}
            {proposalFormError !== "" ? 
            <p>{proposalFormError}</p> 
            : <p></p> }
            {voteMessage && <p>{voteMessage}</p>}
            {!isLoading ? <div className='proposals'>
                {proposalsArray && proposalsArray.map((proposal,index)=>{
                    let date = new Date(parseInt(proposal[5])*1000);
                    const options = { year: 'numeric', month: 'long', day: 'numeric' };
                    const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);
                    return (
                        <Card key={proposal[5]}>
                            <CardHeader>
                                <Heading>{proposal[0]}</Heading>
                            </CardHeader>
                            <CardBody>
                            <p>Proposal #{index+1} </p>
                            <p>Creator: {proposal[1]}</p>
                            <p>Created on the: {formattedDate}</p>
                            <div className='flex-badge'>
                            <Badge colorScheme='green'>FOR: {parseInt(proposal[2])}</Badge>
                            <Badge colorScheme='red'>AGAINST: {parseInt(proposal[3])}</Badge>
                            </div>
                            {window.ethereum && <Input onChange={(e)=>formHandle(e, setVoteAmount, e.target.value)} type="number" placeholder='vote quantity'></Input>}
                            </CardBody>
                            <CardFooter className="flex-badge">
                                <Button onClick={(e)=>voteOnProposal(e, index, voteAmount, true)}>Vote FOR</Button>
                                <Button onClick={(e)=>voteOnProposal(e, index, voteAmount, false)}>Vote AGAINST</Button>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div> : <div className='centered'><MutatingDots 
                         height="100"
                         width="100"
                         color="blue"
                         secondaryColor= 'lightblue'
                         radius='12.5'
                         ariaLabel="mutating-dots-loading"
                         wrapperStyle={{}}
                         wrapperClass=""
                         visible={true}
                        /></div>}
        </div>
    )


}

export default CreateProposal;