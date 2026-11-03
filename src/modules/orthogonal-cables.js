/* Short rectilinear cable routes. Pure geometry, shared by the canvas and regression tests. */
(function(root,factory){
    const api=factory();
    if(typeof module==='object'&&module.exports)module.exports=api;
    else root.OrthogonalCables=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
    'use strict';
    const SPACING=18,EPS=.001;
    const distance=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
    const inside=(p,r)=>p.x>r.left+EPS&&p.x<r.right-EPS&&p.y>r.top+EPS&&p.y<r.bottom-EPS;
    function crosses(a,b,r){
        return a.y===b.y?a.y>r.top+EPS&&a.y<r.bottom-EPS&&Math.max(a.x,b.x)>r.left+EPS&&Math.min(a.x,b.x)<r.right-EPS:
            a.x>r.left+EPS&&a.x<r.right-EPS&&Math.max(a.y,b.y)>r.top+EPS&&Math.min(a.y,b.y)<r.bottom-EPS;
    }
    function simplify(raw){
        const points=[];
        for(const point of raw){
            if(points.length&&!distance(points.at(-1),point))continue;
            points.push(point);
            while(points.length>=3){
                const [a,b,c]=points.slice(-3);
                if(!((a.x===b.x&&b.x===c.x)||(a.y===b.y&&b.y===c.y)))break;
                points.splice(-2,1);
                if(points.length>1&&!distance(points.at(-1),points.at(-2)))points.pop();
            }
        }
        return points;
    }
    class Queue {
        values=[];
        push(value){
            const heap=this.values;let i=heap.length;heap.push(value);
            while(i){const parent=(i-1)>>1;if(heap[parent][0]<=value[0])break;heap[i]=heap[parent];i=parent;}heap[i]=value;
        }
        pop(){
            const heap=this.values,result=heap[0],last=heap.pop();
            if(heap.length){let i=0;while(i*2+1<heap.length){let child=i*2+1;if(child+1<heap.length&&heap[child+1][0]<heap[child][0])child++;
                if(heap[child][0]>=last[0])break;heap[i]=heap[child];i=child;}heap[i]=last;}
            return result;
        }
    }
    function route(start,end,rectangles=[],lanes=[],offset=0){
        // Terminals may overlap a chassis while it is being dragged. Never trap an endpoint.
        const obstacles=rectangles.filter(r=>!inside(start,r)&&!inside(end,r));
        function exit(point){
            let y=point.y+32;
            for(const r of obstacles)if(point.x>r.left&&point.x<r.right&&r.top>=point.y)y=Math.min(y,r.top);
            return {x:point.x,y};
        }
        const a=exit(start),b=exit(end);
        const xs=new Set([a.x,b.x,a.x-SPACING,a.x+SPACING,b.x-SPACING,b.x+SPACING]);
        const ys=new Set([a.y,b.y,a.y-SPACING,a.y+SPACING,b.y-SPACING,b.y+SPACING,Math.max(a.y,b.y)+Math.abs(offset)]);
        for(const r of obstacles){xs.add(r.left);xs.add(r.right);ys.add(r.top);ys.add(r.bottom);}
        const local=lanes.filter(l=>l.axis==='h'?l.right>=Math.min(a.x,b.x)-72&&l.left<=Math.max(a.x,b.x)+72:
            l.bottom>=Math.min(a.y,b.y)-72&&l.top<=Math.max(a.y,b.y)+72);
        for(const l of local){
            const set=l.axis==='h'?ys:xs,value=l.axis==='h'?l.y:l.x;set.add(value-SPACING);set.add(value+SPACING);
        }
        const xx=[...xs].sort((x,y)=>x-y),yy=[...ys].sort((x,y)=>x-y),ny=yy.length;
        const source=xx.indexOf(a.x)*ny+yy.indexOf(a.y),target=xx.indexOf(b.x)*ny+yy.indexOf(b.y);
        const point=node=>({x:xx[Math.floor(node/ny)],y:yy[node%ny]});
        const blocked=new Map();
        function clear(u,v,p,q){
            const key=Math.min(u,v)+':'+Math.max(u,v);
            if(!blocked.has(key))blocked.set(key,obstacles.some(r=>crosses(p,q,r)));
            return !blocked.get(key);
        }
        function congestion(p,q,axis){
            let penalty=0;
            for(const l of local){
                if((axis===0)!==(l.axis==='h'))continue;
                const separation=Math.abs(axis===0?p.y-l.y:p.x-l.x);
                if(separation>=SPACING-EPS)continue;
                const overlap=axis===0?Math.min(Math.max(p.x,q.x),l.right)-Math.max(Math.min(p.x,q.x),l.left):
                    Math.min(Math.max(p.y,q.y),l.bottom)-Math.max(Math.min(p.y,q.y),l.top);
                if(overlap>0)penalty+=overlap*.35*(1-separation/SPACING);
            }
            return penalty;
        }
        function search(separate=false,maxLength=Infinity){
            const queue=new Queue(),best=new Map(),initial=source*3+2;
            best.set(initial,{cost:0,length:0,previous:null});queue.push([distance(a,b),initial,0]);
            while(queue.values.length){
                const [,key,cost]=queue.pop(),current=best.get(key);
                if(current.cost!==cost)continue;
                const node=Math.floor(key/3),heading=key%3,p=point(node);
                if(node===target){
                    const points=[];for(let k=key;k!==null;k=best.get(k).previous)points.push(point(Math.floor(k/3)));
                    return {points:points.reverse(),length:current.length};
                }
                const ix=Math.floor(node/ny),iy=node%ny;
                for(const next of [ix?node-ny:-1,ix+1<xx.length?node+ny:-1,iy?node-1:-1,iy+1<ny?node+1:-1]){
                    if(next<0)continue;
                    const q=point(next),axis=p.y===q.y?0:1;
                    // Keep a short downward strain relief at both jacks without retracing it.
                    if((node===source&&q.y<p.y)||(next===target&&q.y>p.y))continue;
                    const length=current.length+distance(p,q);
                    if(length+distance(q,b)>maxLength+EPS||!clear(node,next,p,q))continue;
                    const nextCost=cost+distance(p,q)+(heading!==2&&axis!==heading?6:0)+(separate?congestion(p,q,axis):0);
                    const nextKey=next*3+axis;
                    if(best.has(nextKey)&&best.get(nextKey).cost<=nextCost)continue;
                    best.set(nextKey,{cost:nextCost,length,previous:key});queue.push([nextCost+distance(q,b),nextKey,nextCost]);
                }
            }
            return null;
        }
        const shortest=search();
        // Lane separation is a preference, never a reason to wrap around the entire scene.
        const chosen=(shortest&&local.length?search(true,shortest.length+SPACING*4):null)||shortest;
        return simplify([start,...(chosen?.points||[a,{x:b.x,y:a.y},b]),end]);
    }
    return {route};
});
