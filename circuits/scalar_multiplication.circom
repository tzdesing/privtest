pragma circom 2.1.6;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/babyjub.circom";
include "../node_modules/circomlib/circuits/mux1.circom";
include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/escalarmulfix.circom";

template ValidatC2 ( ){
    signal input pubX;  
    signal input pubY;  
    signal input c2;        
    signal input message;       
    signal input r;
    signal sharedPointX;
    signal sharedPointY;    
    
    //component babyPbk = BabyPbk();
    //babyPbk.in <== privKey;

    //signal ointX;
    //signal ointY; 
    //ointX  <== babyPbk.Ax;
    //ointY  <== babyPbk.Ay;
    component scalar_bits2 = Num2Bits(253);
    scalar_bits2.in <== r;
    var j;
    component mulFix2 = EscalarMulFix(253, [pubX,pubY]);
    for (j=0; j<253; j++) {
        mulFix2.e[j] <== scalar_bits2.out[j];
    }
    
    sharedPointX <== mulFix2.out[0];  
    
    signal sharedKey;
    sharedKey <== Poseidon(1)([sharedPointX]);
   
    signal calculatedC2;
    calculatedC2 <== message + sharedKey;
    c2 === calculatedC2;

}

component main = ValidatC2();