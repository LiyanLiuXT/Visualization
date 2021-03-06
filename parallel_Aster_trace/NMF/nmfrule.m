function [A,Y,numIter,tElapsed,finalResidual]=nmfrule(X,k,option)
% NMF based on multiple update rules: X=AY, s.t. X,A,Y>=0.
% Definition:
%     [A,Y,numIter,tElapsed,finalResidual]=nmfrule(X,k)
%     [A,Y,numIter,tElapsed,finalResidual]=nmfrule(X,k,option)
% X: non-negative matrix, dataset to factorize, each column is a sample, and each row is a feature.
% k: number of clusters.
% option: struct:
% option.distance: distance used in the objective function. It could be
%    'ls': the Euclidean distance (defalut),
%    'kl': KL divergence.
% option.iter: max number of interations. The default is 1000.
% option.dis: boolen scalar, It could be 
%     false: not display information,
%     true: display (default).
% option.residual: the threshold of the fitting residual to terminate. 
%    If the ||X-XfitThis||<=option.residual, then halt. The default is 1e-4.
% option.tof: if ||XfitPrevious-XfitThis||<=option.tof, then halt. The default is 1e-4.
% A: matrix, the basis matrix.
% Y: matrix, the coefficient matrix.
% numIter: scalar, the number of iterations.
% tElapsed: scalar, the computing time used.
% finalResidual: scalar, the fitting residual.
% References:
%  [1]\bibitem{NMF_Lee1999}
%     D.D. Lee and S. Seung,
%     ``Learning the parts of objects by non-negative matrix factorization,''
%     {\it Science},
%     vol. 401, pp. 788-791, 1999.
%  [2]\bibitem{NMF_Lee2001}
%     D.D. Lee and S. Seung,
%     ``Algorithms for non-negative matrix factorization,''
%     {\it Advances in Neural Information Processing Systems}, 
%     vol. 13, pp. 556-562, 2001.

tStart=tic;
optionDefault.distance='kl';
optionDefault.iter=150;
optionDefault.dis=true;
optionDefault.residual=1e-5;
optionDefault.tof=1e-5;
if nargin<3
   option=optionDefault;
else
    option=mergeOption(option,optionDefault);
end

% iter: number of iterations
[r,c]=size(X); % c is # of samples, r is # of features
Y=rand(k,c);
% Y(Y<eps)=0;
Y=max(Y,eps);
A=X/Y;
% A(A<eps)=0;
A=max(A,eps);
XfitPrevious=Inf;
for i=1:option.iter
    switch option.distance
        case 'ls'
            A=A.*((X*Y')./(A*(Y*Y')));
%             A(A<eps)=0;
                A=max(A,eps);
            Y=Y.*((A'*X)./(A'*A*Y));
%             Y(Y<eps)=0;
                Y=max(Y,eps);
        case 'kl'
            A=A.*(((X./(A*Y))*Y')./(ones(r,1)*sum(Y,2)'));
            A=max(A,eps);
            Y=Y.*((A'*(X./(A*Y)))./(sum(A,1)'*ones(1,c)));
            Y=max(Y,eps);
        otherwise
            error('Please select the correct distance: option.distance=''ls''; or option.distance=''kl'';');
    end
    if mod(i,100)==0 || i==option.iter
        if option.dis
            disp(['Iterating >>>>>> ', num2str(i),'th']);
        end
        XfitThis=A*Y;
        fitRes=matrixNorm(XfitPrevious-XfitThis);
			disp(fitRes);
        XfitPrevious=XfitThis;
        curRes=norm(X-XfitThis,'fro');
			disp(curRes);
        if option.tof>=fitRes || option.residual>=curRes || i==option.iter
            s=sprintf('Mutiple update rules based NMF successes! \n # of iterations is %0.0d. \n The final residual is %0.4d.',i,curRes);
            disp(s);
            numIter=i;
            finalResidual=curRes;
            break;
        end
    end
    
    tElapsed=toc(tStart);
end
disp(tElapsed);
topic_word_name = sprintf('D:\\Ching\\lab\\parallel_Aster_trace\\NMF\\topic_word.csv',i);
dlmwrite(topic_word_name,Y);
end

