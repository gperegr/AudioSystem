// Existing studio suites enter through the new home screen on each document navigation.
module.exports=page=>{
    page.on('domcontentloaded',()=>{
        page.locator('#home-menu[open] [data-home="continue"]').click({timeout:20000}).catch(error=>{
            if(!page.isClosed()&&!/closed|navigation|destroyed|Timeout/.test(error.message))throw error;
        });
    });
};
