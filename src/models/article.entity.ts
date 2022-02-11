import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity({ name: "article" })
export class ArticleEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '主键，文章的id' })
  id: number;

  @Column({ comment: '作者的id', type: 'bigint', nullable: false, default: 0 })
  userId: number;

  @Column({ comment: '文章标题', nullable: false })
  title: string;

  @Column({ comment: '文章的摘要', nullable: false,type:'text' })
  description: string;

  @Column({ comment: "文章的内容", nullable: false, type: 'longtext' })
  content: string;

  @Column({ comment: "文章的分区Id", nullable: false })
  fieldId: number;

  @Column({ comment: '文章点赞数', default: 0 })
  likeNum: number;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt?: Date;

  @UpdateDateColumn({ comment: '最后修改时间' })
  updatedAt?: Date;

  @Column({ comment: '是否可见', default: 0 })
  isVisiable?: boolean;

  @Column({ comment: '是否删除', default: 0 })
  isDeleted?: boolean;

}
