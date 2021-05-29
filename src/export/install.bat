echo Installation de votre bot
echo Cet utilitaire va installer sur cette machine les modules nécessaires pour votre bot
call npm i
cd ./extensions
for /d %%a in (*) do (
	echo Installation de %%a
    cd "./%%a"
    if exist package.json (call npm i)
    cd "./back-end" 
    if exist package.json (call npm i)
    cd ../..
    echo Installation de %%a terminée
)
