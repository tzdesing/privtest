pragma circom 2.1.6;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/babyjub.circom";
include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/escalarmulfix.circom";


template C2Verify() {
    signal input sharedPointX;   
    signal input message; 
    signal output c2;    
             
    signal sharedKey;
    signal calculatedC2;
          
    sharedKey <== Poseidon(1)([sharedPointX]);   
    calculatedC2 <== message + sharedKey;
    c2 <== calculatedC2;

}
component main = C2Verify();