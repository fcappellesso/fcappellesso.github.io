/* LEMA's existing 73-frame artwork, played locally without a service or library. */
(() => {
  const rows = {idle:[0,[280,110,110,140,140,320]],'running-right':[1,[120,120,120,120,120,120,120,220]],'running-left':[2,[120,120,120,120,120,120,120,220]],waving:[3,[140,140,140,280]],jumping:[4,[140,140,140,140,280]],failed:[5,[140,140,140,140,140,140,140,240]],waiting:[6,[150,150,150,150,150,260]],running:[7,[120,120,120,120,120,220]],review:[8,[150,150,150,150,150,280]]};
  const words = {
    en:{title:'Meet Lema',hint:'Move the pointer near Lema. Click to wave; double-click to jump.',close:'Close',label:'Lema: click to wave, double-click to jump',idle:'Rest', 'running-right':'Move right','running-left':'Move left',waving:'Wave',jumping:'Jump',failed:'Oops!',waiting:'Wait',running:'Type',review:'Review'},
    pt:{title:'Conheça Lema',hint:'Mova o cursor perto de Lema. Clique para acenar; clique duas vezes para saltar.',close:'Fechar',label:'Lema: clique para acenar, clique duas vezes para saltar',idle:'Descansar','running-right':'Ir à direita','running-left':'Ir à esquerda',waving:'Acenar',jumping:'Saltar',failed:'Ops!',waiting:'Esperar',running:'Digitar',review:'Revisar'},
    it:{title:'Conosci Lema',hint:'Muovi il puntatore vicino a Lema. Clicca per salutare; fai doppio clic per saltare.',close:'Chiudi',label:'Lema: clicca per salutare, doppio clic per saltare',idle:'Riposare','running-right':'Andare a destra','running-left':'Andare a sinistra',waving:'Salutare',jumping:'Saltare',failed:'Ops!',waiting:'Aspettare',running:'Scrivere',review:'Rivedere'}
  };
  const language = () => document.documentElement.lang.startsWith('pt')?'pt':document.documentElement.lang.startsWith('it')?'it':'en';
  class LemaPet extends HTMLElement {
    connectedCallback() {
      if(this.canvas)return;
      this.state='running';this.setAttribute('data-state','running');this.frame=0;this.deadline=0;this.gazeUntil=0;this.lockUntil=0;this.visible=true;
      this.canvas=document.createElement('canvas');this.canvas.width=192;this.canvas.height=208;this.canvas.setAttribute('aria-hidden','true');
      this.button=document.createElement('button');this.button.type='button';this.button.className='lema-sprite-button';this.button.append(this.canvas);this.append(this.button);
      this.context=this.canvas.getContext('2d');this.image=new Image();this.image.src=this.getAttribute('src')||'assets/lema/spritesheet.png';
      this.motion=matchMedia('(prefers-reduced-motion: reduce)');
      this.label=()=>this.button.setAttribute('aria-label',words[language()].label);this.label();
      this.image.onload=()=>{this.setAttribute('data-ready','');this.draw(0,0);this.tick(performance.now());};
      this.click=()=>{clearTimeout(this.clickTimer);this.clickTimer=setTimeout(()=>this.play('waving',true),230);};
      this.double=()=>{clearTimeout(this.clickTimer);this.play('jumping',true);};
      this.button.addEventListener('click',this.click);this.button.addEventListener('dblclick',this.double);
      this.pointer=(event)=>{
        if(this.motion.matches||event.pointerType==='touch'||performance.now()<this.lockUntil||!this.visible||this.closest('dialog')&&!this.closest('dialog').open)return;
        const b=this.getBoundingClientRect(),dx=event.clientX-(b.left+b.width/2),dy=event.clientY-(b.top+b.height*.35);
        if(Math.hypot(dx,dy)>430||Math.hypot(dx,dy)<15)return;
        this.direction=(Math.round((Math.atan2(dx,-dy)*180/Math.PI+360)%360/22.5))%16;this.gazeUntil=performance.now()+950;
      };
      document.addEventListener('pointermove',this.pointer,{passive:true});
      this.observer=new IntersectionObserver(([entry])=>this.visible=entry.isIntersecting);this.observer.observe(this);
      this.languageObserver=new MutationObserver(this.label);this.languageObserver.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    }
    play(state,once=false){
      if(!rows[state])return;
      this.state=state;this.frame=0;this.deadline=0;this.gazeUntil=0;this.once=once;
      this.lockUntil=performance.now()+rows[state][1].reduce((a,b)=>a+b,0);
      this.setAttribute('data-state',state);
      this.dispatchEvent(new CustomEvent('lemastate',{detail:state,bubbles:true}));
    }
    draw(row,frame){this.context.clearRect(0,0,192,208);this.context.drawImage(this.image,frame*192,row*208,192,208,0,0,192,208);this.setAttribute('data-frame',row+':'+frame);}
    tick(time){
      if(!this.isConnected)return;
      if(this.visible&&!document.hidden&&(!this.closest('dialog')||this.closest('dialog').open)){
        if(this.motion.matches){if(this.getAttribute('data-frame')!=='0:0')this.draw(0,0);}
        else if(time<this.gazeUntil){this.draw(9+Math.floor(this.direction/8),this.direction%8);}
        else if(time>=this.deadline){
          let [row,durations]=rows[this.state];
          if(this.frame>=durations.length){if(this.once){this.state='running';this.once=false;[row,durations]=rows.running;this.setAttribute('data-state','running');this.dispatchEvent(new CustomEvent('lemastate',{detail:'running',bubbles:true}));}this.frame=0;}
          this.draw(row,this.frame);this.deadline=time+durations[this.frame];this.frame++;
        }
      }
      this.animation=requestAnimationFrame(t=>this.tick(t));
    }
    disconnectedCallback(){cancelAnimationFrame(this.animation);clearTimeout(this.clickTimer);document.removeEventListener('pointermove',this.pointer);this.observer?.disconnect();this.languageObserver?.disconnect();}
  }
  customElements.define('lema-pet',LemaPet);
  const dialog=document.querySelector('#lema-dialog');if(!dialog)return;
  const demo=dialog.querySelector('lema-pet');
  const localize=()=>{
    const w=words[language()];dialog.querySelector('h2').textContent=w.title;dialog.querySelector('.pet-hint').textContent=w.hint;
    dialog.querySelector('.pet-close').setAttribute('aria-label',w.close);
    document.querySelector('.pet-open').setAttribute('aria-label',w.title);
    dialog.querySelectorAll('[data-pet-state]').forEach(button=>button.textContent=w[button.dataset.petState]);
  };
  for(const state of Object.keys(rows)){const button=document.createElement('button');button.type='button';button.dataset.petState=state;button.setAttribute('aria-pressed',String(state==='running'));button.addEventListener('click',()=>demo.play(state));dialog.querySelector('.pet-states').append(button);}
  demo.addEventListener('lemastate',event=>dialog.querySelectorAll('[data-pet-state]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.petState===event.detail))));
  document.querySelector('.pet-open').addEventListener('click',()=>{dialog.showModal();demo.play('waving',true);});
  dialog.querySelector('.pet-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  new MutationObserver(localize).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});localize();
})();
